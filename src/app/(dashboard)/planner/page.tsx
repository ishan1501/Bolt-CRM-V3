"use client";

import { useState, useEffect } from "react";
import { usePlannerStore, PlannerTask } from "@/stores/planner-store";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckSquare, ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTask, setNewTask] = useState("");
  
  const { addTask, toggleTask, deleteTask, getTasksForDate, fetchTodos } = usePlannerStore();
  
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const dateKey = currentDate.toISOString().slice(0, 10);
  const tasks = getTasksForDate(dateKey);

  const isToday = new Date().toISOString().slice(0, 10) === dateKey;

  const handlePrevDay = () => {
    setCurrentDate(new Date(currentDate.getTime() - 86400000));
  };

  const handleNextDay = () => {
    setCurrentDate(new Date(currentDate.getTime() + 86400000));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(dateKey, newTask.trim());
    setNewTask("");
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bolt-bg-depth-2)] flex items-center justify-center shadow-sm border border-[var(--bolt-border-color)]">
            <CheckSquare size={24} className="text-[var(--bolt-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--bolt-text-primary)]">Daily Planner</h1>
            <p className="text-sm text-[var(--bolt-text-secondary)]">Plan and track your daily tasks.</p>
          </div>
        </div>

        {/* Navigator */}
        <div className="flex items-center justify-between w-full md:w-auto bg-[var(--bolt-bg-depth-2)] p-1.5 rounded-xl border border-[var(--bolt-border-color)] shadow-sm">
          <button onClick={handlePrevDay} className="p-2 hover:bg-white/10 rounded-lg text-[var(--bolt-text-secondary)] hover:text-white transition-colors shrink-0">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-[var(--bolt-text-primary)]">
              {currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            {isToday && <span className="text-[10px] text-[var(--bolt-accent)] font-bold uppercase tracking-wider">Today</span>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleNextDay} className="p-2 hover:bg-white/10 rounded-lg text-[var(--bolt-text-secondary)] hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
            {!isToday && (
              <button onClick={handleToday} className="ml-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-[var(--bolt-accent)] text-black">
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--bolt-text-primary)]">Tasks for {currentDate.toLocaleDateString("en-US", { weekday: "long" })}</h2>
          {tasks.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--bolt-text-secondary)]">
                {completedCount} of {tasks.length} done
              </span>
              <div className="w-24 h-2 rounded-full bg-[var(--bolt-bg-depth-3)] overflow-hidden">
                <div className="h-full bg-[var(--bolt-accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAddTask} className="mb-6 relative">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--bolt-text-primary)] placeholder:text-[var(--bolt-text-tertiary)] outline-none focus:border-[var(--bolt-accent)] transition-colors shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!newTask.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--bolt-accent)] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#eab308] transition-colors"
          >
            <Plus size={16} />
          </button>
        </form>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Calendar size={48} className="text-[var(--bolt-text-tertiary)] mb-4 opacity-50" />
              <p className="text-[var(--bolt-text-secondary)] font-medium">No tasks scheduled for this day.</p>
              <p className="text-xs text-[var(--bolt-text-tertiary)] mt-1">Use the input above to add one.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all group",
                  task.done 
                    ? "bg-[var(--bolt-bg-depth-3)]/50 border-transparent" 
                    : "bg-[var(--bolt-bg-depth-2)] border-[var(--bolt-border-color)] hover:border-[var(--bolt-accent)]/50"
                )}
              >
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleTask(dateKey, task.id)}>
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                    task.done ? "bg-[var(--bolt-accent)] border-[var(--bolt-accent)] text-black" : "border-[var(--bolt-text-tertiary)] group-hover:border-[var(--bolt-accent)] text-transparent"
                  )}>
                    <CheckSquare size={14} className={task.done ? "opacity-100" : "opacity-0"} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-all select-none",
                    task.done ? "text-[var(--bolt-text-tertiary)] line-through" : "text-[var(--bolt-text-primary)]"
                  )}>
                    {task.text}
                  </span>
                </div>
                
                <button 
                  onClick={() => deleteTask(dateKey, task.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--bolt-text-tertiary)] hover:text-rose-400 hover:bg-rose-400/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
