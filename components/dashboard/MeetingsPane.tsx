"use client";

import { memo } from "react";
import Link from "next/link";
import { Clock, Plus, Loader2, FileText, AlertCircle } from "lucide-react";
import { useUploadModal } from "@/contexts/UploadModalProvider";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthProvider";
import { useMeetings } from "@/hooks/useMeetings";
import { formatDuration } from "@/lib/utils/formatters";
import { MeetingsPaneSkeleton } from "@/components/ui/Skeleton";

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
          className="group p-4 mb-3 rounded-xl bg-gradient-accent border-2 border-border hover:border-primary/50 cursor-pointer transition-all duration-300 card-hover slide-in-up relative overflow-hidden"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
          <p className="font-semibold text-foreground truncate mb-2 group-hover:text-primary transition-colors relative z-10">
            {meeting.title}
          </p>
          <div className="flex items-center text-xs text-muted-foreground relative z-10">
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
  const { meetings, loading, error, hasMore, loadMore } = useMeetings(user);

  return (
    <aside className="w-80 flex-shrink-0 modern-card flex flex-col slide-in-right">
      <header className="p-6 border-b border-border bg-gradient-accent flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Meetings</h2>
        <button
          onClick={openUploadModal}
          className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 btn-smooth ring-1 ring-transparent hover:ring-primary/20"
          aria-label="Upload a new meeting"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <MeetingsPaneSkeleton />
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
          <>
            <div className="space-y-3">
              {meetings.map((meeting, index) => (
                <MeetingCard key={meeting.id} meeting={meeting} index={index} />
              ))}
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full mt-4 py-2 px-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors btn-smooth"
              >
                Load more meetings
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}