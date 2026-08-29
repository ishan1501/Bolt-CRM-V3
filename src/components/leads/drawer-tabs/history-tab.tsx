"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Spinner } from "@/components/ui/spinner";
import { useMemo } from "react";
import { format } from "date-fns";
import { Circle } from "lucide-react";

function extractTimeline(raw: unknown): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw as Record<string, any>;
  if (Array.isArray(r.data)) return r.data;
  if (Array.isArray(r.data?.result)) return r.data.result;
  if (Array.isArray(r.result)) return r.result;
  if (Array.isArray(r.data?.timeline)) return r.data.timeline;
  if (Array.isArray(r.data?.events)) return r.data.events;
  return [];
}

export function HistoryTab({ uuid }: { uuid: string }) {
  const { data: rawTimeline, isLoading, error } = useQuery({
    queryKey: queryKeys.timeline(uuid),
    queryFn: () => crmApi.fetchTimeline(uuid),
  });

  const timeline = useMemo(() => extractTimeline(rawTimeline), [rawTimeline]);

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500 text-sm">Failed to load timeline.</div>;

  if (timeline.length === 0) {
    return <div className="text-center text-[var(--bolt-text-secondary)] text-sm py-8">No history available.</div>;
  }

  return (
    <div className="relative border-l border-[var(--bolt-border-color)] ml-3 space-y-8 pb-8">
      {timeline.map((event: any, i: number) => (
        <div key={event.uuid || event.id || i} className="relative pl-6">
          <div className="absolute -left-[5px] top-1 surface-1 rounded-full">
            <Circle size={10} className="fill-blue-500 text-blue-500" />
          </div>
          <div className="text-sm font-medium text-[var(--bolt-text-primary)]">{event.event_type || event.eventType || event.type || event.action || "Event"}</div>
          <div className="text-xs text-[var(--bolt-text-secondary)] mt-1">{event.description || event.message || event.details || JSON.stringify(event).slice(0, 120)}</div>
          <div className="text-xs text-[var(--bolt-text-tertiary)] mt-2 font-mono">
            {event.created_at || event.createdAt
              ? format(new Date(event.created_at || event.createdAt), "MMM d, yyyy h:mm a")
              : "-"}
          </div>
        </div>
      ))}
    </div>
  );
}
