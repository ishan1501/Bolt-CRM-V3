"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface NoteItem {
  id?: number;
  uuid?: string;
  message?: string;
  note?: string;
  text?: string;
  content?: string;
  created_at?: string;
  createdAt?: string;
  created_by_name?: string;
  createdBy?: string;
  author?: string;
  userName?: string;
}

/** Extract notes array from deeply nested API response */
function extractNotes(raw: unknown): NoteItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw as Record<string, any>;

  // { data: { leadNotes: [...] } }
  if (Array.isArray(r.data?.leadNotes)) return r.data.leadNotes;
  // { data: [...] }
  if (Array.isArray(r.data)) return r.data;
  // { data: { result: [...] } }
  if (Array.isArray(r.data?.result)) return r.data.result;
  // { data: { notes: [...] } }
  if (Array.isArray(r.data?.notes)) return r.data.notes;
  // { data: { data: [...] } }
  if (Array.isArray(r.data?.data)) return r.data.data;
  // { result: [...] }
  if (Array.isArray(r.result)) return r.result;
  // { notes: [...] }
  if (Array.isArray(r.notes)) return r.notes;

  // If it's a single object with a message, wrap it
  if (r.message || r.note) return [r];
  if (r.data?.message || r.data?.note) return [r.data];

  return [];
}

function getNoteMessage(note: NoteItem): string {
  return note.message || note.note || note.text || note.content || JSON.stringify(note);
}

function getNoteAuthor(note: NoteItem & { admin?: { name?: string } }): string {
  return note.admin?.name || note.created_by_name || note.createdBy || note.author || note.userName || "Agent";
}

function getNoteDate(note: NoteItem): string | null {
  return note.created_at || note.createdAt || null;
}

export function NotesTab({ uuid }: { uuid: string }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: rawNotes, isLoading } = useQuery({
    queryKey: queryKeys.notes(uuid),
    queryFn: () => crmApi.fetchNotes(uuid),
  });

  const notes = useMemo(() => extractNotes(rawNotes), [rawNotes]);

  const mutation = useMutation({
    mutationFn: (msg: string) => crmApi.createNote(uuid, msg),
    onSuccess: () => {
      toast.success("Note added");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(uuid) });
    },
    onError: () => toast.error("Failed to add note"),
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-220px)]">
      {/* Composer */}
      <div className="surface-2 rounded-xl p-3 space-y-2 border border-[var(--bolt-border-color)]">
        <textarea
          className="w-full surface-input rounded-lg p-3 text-sm min-h-[70px] resize-none placeholder:text-[var(--bolt-text-tertiary)]"
          placeholder="Type a new note..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && message.trim()) {
              mutation.mutate(message);
            }
          }}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--bolt-text-tertiary)]">⌘+Enter to send</span>
          <Button
            size="sm"
            disabled={!message.trim() || mutation.isPending}
            onClick={() => mutation.mutate(message)}
          >
            {mutation.isPending ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-[var(--bolt-text-tertiary)] mb-2" />
            <div className="text-[var(--bolt-text-secondary)] text-sm">No notes yet. Add the first one above.</div>
          </div>
        ) : (
          notes.map((note, i) => (
            <div
              key={note.uuid || note.id || i}
              className="surface-2 p-4 rounded-xl text-sm space-y-2 border border-[var(--bolt-border-color)]"
            >
              <p className="text-[var(--bolt-text-primary)] whitespace-pre-wrap">
                {getNoteMessage(note)}
              </p>
              <div className="flex justify-between items-center text-[11px] text-[var(--bolt-text-secondary)]">
                <span className="font-medium uppercase tracking-wider">{getNoteAuthor(note)}</span>
                <span>
                  {getNoteDate(note)
                    ? format(new Date(getNoteDate(note)!), "dd/MM/yyyy, hh:mm a")
                    : "just now"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
