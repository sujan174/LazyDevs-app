"use client";

import { memo } from "react";
import Link from "next/link";
import { Clock, Plus, Loader2, FileText, AlertCircle, Calendar } from "lucide-react";
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
          className={`group p-6 rounded-xl bg-gradient-accent border border-border hover:border-primary/50 cursor-pointer transition-all duration-300 card-hover slide-in-up relative overflow-hidden ${index < 6 ? `stagger-${index + 1}` : ''}`}
        >
          {/* Decorative gradient orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

          <div className="relative z-10">
            <h3 className="font-semibold text-lg text-foreground truncate mb-3 group-hover:text-primary transition-colors">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  {meeting.createdAt
                    ? format(meeting.createdAt.toDate(), "MMM d, yyyy")
                    : "Date unknown"}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{formatDuration(meeting.durationMs)}</span>
              </div>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </Link>
    );
  }
);

MeetingCard.displayName = "MeetingCard";

export default function MeetingsPage() {
  const { openUploadModal } = useUploadModal();
  const { user } = useAuth();
  const { meetings, loading, error, hasMore, loadMore } = useMeetings(user);

  return (
    <div className="h-full p-6 sm:p-8 overflow-y-auto page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 slide-in-down">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Meetings</h1>
            <p className="text-muted-foreground">
              View and manage all your meeting recordings and transcripts.
            </p>
          </div>
          <button
            onClick={openUploadModal}
            className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
            aria-label="Upload a new meeting"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Meeting</span>
          </button>
        </div>

        {/* Content */}
        <div className="fade-in">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shimmer h-32 rounded-xl bg-card/50" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error loading meetings
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Try again
              </button>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 pulse-glow">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No meetings yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Upload your first meeting recording to get started with AI-powered insights and transcriptions.
              </p>
              <button
                onClick={openUploadModal}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Upload Your First Meeting</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meetings.map((meeting, index) => (
                  <MeetingCard key={meeting.id} meeting={meeting} index={index} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4" />
                    <span>Load more meetings</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
