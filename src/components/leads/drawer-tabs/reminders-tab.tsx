"use client";

import { useReminderStore } from "@/stores/reminder-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function RemindersTab({ uuid, leadName }: { uuid: string; leadName?: string }) {
  const { reminders, addReminder, markCompleted } = useReminderStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const leadReminders = reminders.filter(r => r.leadUuid === uuid).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAdd = () => {
    if (!title || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }
    
    const dateTime = new Date(`${date}T${time}`).toISOString();
    
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    addReminder({
      id: Math.random().toString(36).substr(2, 9),
      leadUuid: uuid,
      leadName: leadName || "Lead",
      title,
      date: dateTime,
      completed: false
    });
    
    setTitle("");
    setDate("");
    setTime("");
    toast.success("Reminder added");
  };

  return (
    <div className="space-y-6">
      <div className="surface-2 p-4 rounded-xl space-y-3">
        <h3 className="text-sm font-semibold">New Reminder</h3>
        <input 
          type="text" 
          placeholder="Call regarding admission..." 
          className="w-full surface-input rounded-lg px-3 py-2 text-sm"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="flex gap-2">
          <input 
            type="date" 
            className="flex-1 surface-input rounded-lg px-3 py-2 text-sm"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <input 
            type="time" 
            className="flex-1 surface-input rounded-lg px-3 py-2 text-sm"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleAdd}>Set Reminder</Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--bolt-text-secondary)]">Upcoming for this lead</h3>
        {leadReminders.length === 0 ? (
          <div className="text-sm text-[var(--bolt-text-secondary)] text-center py-4">No reminders set.</div>
        ) : (
          leadReminders.map(r => (
            <div key={r.id} className={`p-3 rounded-lg border transition-opacity ${r.completed ? 'opacity-50 border-[var(--bolt-border-color)]' : 'border-blue-500/25 bg-blue-500/8'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-sm font-medium text-[var(--bolt-text-primary)] ${r.completed ? 'line-through' : ''}`}>{r.title}</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {formatDistanceToNow(new Date(r.date), { addSuffix: true })}
                  </div>
                </div>
                {!r.completed && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markCompleted(r.id)}>
                    Done
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
