"use client";

import { memo } from "react";
import Link from "next/link";
import { Clock, Plus, Loader2, FileText, AlertCircle } from "lucide-react";
import { useUploadModal } from "@/contexts/UploadModalProvider";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useMeetings } from "@/hooks/useMeetings";
import { formatDuration } from "@/lib/utils/formatters";

// Memoized meeting card component for better performance
const MeetingCard = memo(
  ({
    meeting,
    index,
  }: {
    meeting: { id: string; title: string; createdAt: any; durationMs: number };
    index: number;
  }) => {
    return (
      <Link href={`/dashboard/meetings/${meeting.id}`} key={meeting.id}>
        <div
          className="group p-4 mb-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all duration-300 card-hover slide-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <p className="font-semibold text-card-foreground truncate mb-2 group-hover:text-primary transition-colors">
            {meeting.title}
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span>
              {meeting.createdAt
                ? format(meeting.createdAt.toDate(), "MMM d, yyyy")
                : "Date unknown"}
              {" · "}
              {formatDuration(meeting.durationMs)}
            </span>
          </div>
        </div>
      </Link>
    );
  }
);

MeetingCard.displayName = "MeetingCard";

export function MeetingsPane() {
  const { openUploadModal } = useUploadModal();
  const { user } = useAuth();
  const { meetings, loading, error } = useMeetings(user);

  return (
    <aside className="w-80 flex-shrink-0 bg-card rounded-xl border border-border shadow-sm flex flex-col slide-in-right">
      <header className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-card-foreground">Meetings</h2>
        <button
          onClick={openUploadModal}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-200 btn-smooth"
          aria-label="Upload a new meeting"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 fade-in">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-2 text-sm font-medium text-card-foreground">
              Error loading meetings
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-primary hover:text-primary/80 btn-smooth"
            >
              Try again
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-10 px-4 fade-in">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-card-foreground">
              No meetings yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Click the '+' to upload your first recording.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting, index) => (
              <MeetingCard key={meeting.id} meeting={meeting} index={index} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}