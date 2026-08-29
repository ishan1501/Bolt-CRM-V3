import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from "idb-keyval";
import { crmApi } from '@/lib/api';
import { LeadStage } from '@/types/crm';

const idbStorage = {
  getItem: async (name: string) => {
    // Clear old localStorage if it exists to free up quota
    if (typeof window !== 'undefined') localStorage.removeItem('bolt-jobs');
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string) => await set(name, value),
  removeItem: async (name: string) => await del(name),
};

export interface Job {
  id: string;
  type: 'slow_apply';
  title: string;
  total: number;
  completed: number;
  failed: number;
  status: 'running' | 'completed' | 'failed' | 'paused';
  pendingUuids: string[];
  stage?: LeadStage;
  stageMap?: Record<string, LeadStage>;
}

// Module-level map to track active timers per job — prevents overlapping loops
const jobTimers: Record<string, ReturnType<typeof setTimeout>> = {};

interface JobState {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'completed' | 'failed' | 'status'>) => string;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  processNext: (id: string) => Promise<void>;
  startJob: (id: string) => void;
  pauseJob: (id: string) => void;
  resumeAllRunning: () => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      addJob: (jobData) => {
        const id = Math.random().toString(36).substring(7);
        const newJob: Job = {
          ...jobData,
          id,
          completed: 0,
          failed: 0,
          status: 'running',
        };
        // Auto-cleanup completed jobs to prevent the state from growing infinitely
        set((state) => ({ 
          jobs: [newJob, ...state.jobs.filter(j => j.status !== 'completed')] 
        }));
        get().processNext(id);
        return id;
      },
      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        }));
      },
      removeJob: (id) => {
        set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
      },
      startJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: 'running' } : j)),
        }));
        get().processNext(id);
      },
      pauseJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: 'paused' } : j)),
        }));
      },
      resumeAllRunning: () => {
        const state = get();
        state.jobs.forEach(job => {
          if (job.status === 'running' && job.pendingUuids.length > 0) {
            state.processNext(job.id);
          }
        });
      },
      processNext: async (id) => {
        const job = get().jobs.find((j) => j.id === id);
        if (!job || job.status !== 'running' || job.pendingUuids.length === 0) {
          if (job && job.pendingUuids.length === 0 && job.status !== 'completed') {
            get().updateJob(id, { status: 'completed' });
          }
          return;
        }

        const nextUuid = job.pendingUuids[0];
        const stageToApply = job.stageMap ? job.stageMap[nextUuid] : job.stage;
        
        if (!stageToApply) {
          get().updateJob(id, {
            failed: job.failed + 1,
            pendingUuids: job.pendingUuids.slice(1),
          });
          get().processNext(id);
          return;
        }

        try {
          await crmApi.changeLeadStage([nextUuid], stageToApply);
          get().updateJob(id, {
            completed: job.completed + 1,
            pendingUuids: job.pendingUuids.slice(1),
          });
        } catch (_error) {
          get().updateJob(id, {
            failed: job.failed + 1,
            pendingUuids: job.pendingUuids.slice(1),
          });
        }

        const currentJob = get().jobs.find((j) => j.id === id);
        if (currentJob && currentJob.status === 'running' && currentJob.pendingUuids.length > 0) {
          // Clear any existing timer for this job before scheduling a new one
          // This prevents duplicate overlapping loops when pausing/resuming
          if (jobTimers[id]) clearTimeout(jobTimers[id]);
          const delay = Math.floor(Math.random() * 120000);
          jobTimers[id] = setTimeout(() => {
            delete jobTimers[id];
            get().processNext(id);
          }, delay);
        } else if (currentJob && currentJob.pendingUuids.length === 0) {
          if (jobTimers[id]) { clearTimeout(jobTimers[id]); delete jobTimers[id]; }
          get().updateJob(id, { status: 'completed' });
        }
      },
    }),
    {
      name: 'bolt-jobs-v2',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ jobs: state.jobs }),
    }
  )
);
