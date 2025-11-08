/**
 * Skeleton loading components for better UX
 */

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton ${className}`}
      {...props}
    />
  );
}

export function MeetingCardSkeleton() {
  return (
    <div className="p-4 mb-3 rounded-xl bg-card border border-border">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function MeetingsPaneSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <MeetingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TranscriptSegmentSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-20">
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function ActionItemSkeleton() {
  return (
    <div className="p-6 bg-card/50 rounded-lg border border-border">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
      <div className="bg-card rounded-lg p-4 border border-border space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
