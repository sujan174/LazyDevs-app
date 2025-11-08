"use client";

import { useState, memo, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
  User,
  Bot,
  ListTodo,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useMeeting, ActionItem, TranscriptSegment } from "@/hooks/useMeeting";
import {
  formatDuration,
  formatTimestamp,
  getDateFromTimestamp,
} from "@/lib/utils/formatters";
import {
  getSpeakerColor,
  getActionBadge,
} from "@/lib/utils/speaker-colors";

// --- Memoized UI Components ---
const InfoPill = memo(
  ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-card-foreground">{text}</span>
    </div>
  )
);
InfoPill.displayName = "InfoPill";

const TranscriptSegmentComponent = memo(
  ({ segment, index }: { segment: TranscriptSegment; index: number }) => {
    const colorClasses = getSpeakerColor(segment.speaker);

    return (
      <div
        className="flex gap-6 group slide-in-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex-shrink-0 w-20 text-right">
          <span className="inline-block px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
            {formatTimestamp(segment.start_ms)}
          </span>
        </div>
        <div className={`flex-1 border-l-4 ${colorClasses.border} pl-5 py-1`}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-full ${colorClasses.bg} flex items-center justify-center transition-transform hover:scale-110`}
            >
              <User className={`w-4 h-4 ${colorClasses.text}`} />
            </div>
            <p className={`font-semibold ${colorClasses.text}`}>
              {segment.speaker}
            </p>
          </div>
          <p className="text-card-foreground leading-relaxed pl-10">
            {segment.text}
          </p>
        </div>
      </div>
    );
  }
);
TranscriptSegmentComponent.displayName = "TranscriptSegment";

const ActionItemComponent = memo(
  ({ actionItem, index }: { actionItem: ActionItem; index: number }) => {
    const badge = getActionBadge(actionItem.action);

    return (
      <div
        className="p-6 bg-card/50 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 card-hover slide-in-up"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        {/* Action Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text} flex items-center gap-1.5`}
            >
              <span>{badge.icon}</span>
              {badge.label}
            </span>
            {actionItem.id && (
              <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded border border-border">
                #{actionItem.id}
              </span>
            )}
          </div>
        </div>

        {/* Action Content */}
        <div className="bg-card rounded-lg p-4 border border-border">
          {actionItem.action === "comment" && actionItem.data.comment && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-card-foreground leading-relaxed flex-1">
                {actionItem.data.comment}
              </p>
            </div>
          )}

          {actionItem.action === "flag" && (
            <div className="space-y-3">
              {actionItem.data.summary && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">⚠️</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive mb-2">
                      {actionItem.data.summary}
                    </p>
                    {actionItem.data.context && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {actionItem.data.context}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {actionItem.data.parties && actionItem.data.parties.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground font-semibold">
                    Involved:
                  </span>
                  {actionItem.data.parties.map((party, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                    >
                      {party}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {actionItem.action === "meta" && (
            <div className="space-y-2">
              {actionItem.data.name && (
                <p className="text-sm font-semibold text-card-foreground mb-2">
                  {actionItem.data.name}
                </p>
              )}
              {actionItem.data.details && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {actionItem.data.details}
                </p>
              )}
              {actionItem.data.type && (
                <span className="inline-block px-2.5 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium mt-2">
                  {actionItem.data.type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
            </div>
          )}

          {actionItem.action === "update" && (
            <div className="space-y-3">
              {actionItem.data.dependencies?.add &&
                actionItem.data.dependencies.add.length > 0 && (
                  <div className="flex gap-2 items-start">
                    <span className="text-sm text-card-foreground font-semibold">
                      Adding dependency:
                    </span>
                    {actionItem.data.dependencies.add.map((depId, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono"
                      >
                        #{depId}
                      </span>
                    ))}
                  </div>
                )}
              {actionItem.data.updates && (
                <div className="text-sm space-y-2">
                  {actionItem.data.updates.status && (
                    <p className="text-card-foreground">
                      <span className="font-semibold">New Status:</span>{" "}
                      {actionItem.data.updates.status}
                    </p>
                  )}
                  {actionItem.data.updates.description && (
                    <p className="text-muted-foreground">
                      {actionItem.data.updates.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {actionItem.action === "create" && (
            <div className="space-y-3">
              {actionItem.data.task_name && (
                <h4 className="font-semibold text-card-foreground">
                  {actionItem.data.task_name}
                </h4>
              )}
              {actionItem.data.description && (
                <p className="text-sm text-muted-foreground">
                  {actionItem.data.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                {actionItem.data.status && (
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold">Status:</span>{" "}
                    {actionItem.data.status}
                  </span>
                )}
                {actionItem.data.due_date && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">Due:</span>{" "}
                    {actionItem.data.due_date}
                  </span>
                )}
                {actionItem.data.priority && (
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold">Priority:</span>{" "}
                    {actionItem.data.priority}
                  </span>
                )}
              </div>
              {actionItem.data.tags && actionItem.data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {actionItem.data.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {actionItem.action === "close" && (
            <div className="flex items-center gap-2 text-card-foreground">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">
                Mark task as completed
              </span>
            </div>
          )}
        </div>

        {/* Reasoning */}
        {actionItem.reasoning && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors">
              <span>💡</span> View AI Reasoning
            </summary>
            <p className="mt-2 pl-4 text-xs text-muted-foreground border-l-2 border-border leading-relaxed">
              {actionItem.reasoning}
            </p>
          </details>
        )}
      </div>
    );
  }
);
ActionItemComponent.displayName = "ActionItem";

// --- Main Page Component ---
export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const { meeting, loading, error } = useMeeting(meetingId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"actions" | "transcript">(
    "actions"
  );

  // Stop generating state when actions appear
  useEffect(() => {
    if (meeting?.actions && meeting.actions.length > 0) {
      setIsGenerating(false);
    }
  }, [meeting?.actions]);

  const handleGenerateActions = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/meetings/${meetingId}/generate-actions`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || "Failed to start action generation."
        );
      }
    } catch (err: any) {
      console.error("Error generating actions:", err);
      setIsGenerating(false);
    }
  }, [meetingId]);

  const goBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Group actions by type
  const groupedActions =
    meeting?.actions?.reduce(
      (acc, action) => {
        const type = action.action;
        if (!acc[type]) acc[type] = [];
        acc[type].push(action);
        return acc;
      },
      {} as Record<string, ActionItem[]>
    ) || {};

  const hasActions =
    meeting?.actions && Array.isArray(meeting.actions) && meeting.actions.length > 0;
  const isProcessing = meeting?.status === "processing" || isGenerating;

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center fade-in">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-card-foreground mb-2">
          Error Loading Meeting
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error ||
            "The meeting could not be found or you do not have permission to view it."}
        </p>
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all btn-smooth"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const formatMeetingDate = (timestamp: any): string => {
    const date = getDateFromTimestamp(timestamp);
    if (!date) return "Date unknown";
    try {
      return format(date, "MMM d, yyyy");
    } catch (err) {
      return "Date unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background fade-in">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors btn-smooth"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Meetings
        </button>

        {/* Meeting Header Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 mb-6 slide-in-up gradient-bg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-card-foreground mb-4">
                {meeting.title}
              </h1>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <InfoPill
                  icon={Clock}
                  text={formatMeetingDate(meeting.createdAt)}
                />
                <InfoPill
                  icon={Clock}
                  text={formatDuration(meeting.durationMs)}
                />
                <InfoPill
                  icon={Users}
                  text={`${meeting.totalSpeakers} speakers`}
                />
                <InfoPill
                  icon={MessageSquare}
                  text={`${meeting.totalSegments} segments`}
                />
              </div>
            </div>
            {hasActions && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg scale-in">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                  {meeting.actions?.length || 0} Action
                  {meeting.actions?.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {meeting.unresolvedCount > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong className="font-semibold">
                  {meeting.unresolvedCount}
                </strong>{" "}
                unidentified speaker(s) need your attention.
                <a
                  href="#"
                  className="font-semibold underline ml-2 hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  Resolve Now
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-card rounded-t-xl shadow-sm border border-border border-b-0 slide-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("actions")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === "actions"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTodo className="w-5 h-5" />
              Action Items
              {hasActions && (
                <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {meeting.actions?.length || 0}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === "transcript"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-5 h-5" />
              Transcript
              <span className="ml-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-bold">
                {meeting?.totalSegments || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-card rounded-b-xl shadow-sm border border-border border-t-0 p-8 slide-in-up" style={{ animationDelay: "150ms" }}>
          {/* Actions Tab */}
          {activeTab === "actions" && (
            <>
              {!hasActions && !isProcessing && (
                <div className="text-center py-16 fade-in">
                  <div className="mb-4 inline-flex p-4 bg-primary/5 rounded-full">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No Action Items Yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Let AI analyze your meeting transcript and generate
                    actionable tasks automatically.
                  </p>
                  <button
                    onClick={handleGenerateActions}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold btn-smooth"
                  >
                    <Bot className="w-5 h-5" />
                    Generate Action Items
                  </button>
                </div>
              )}

              {isProcessing && !hasActions && (
                <div className="text-center py-16 fade-in">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    AI is Analyzing Your Meeting
                  </h3>
                  <p className="text-muted-foreground">
                    This may take a minute. Results will appear automatically.
                  </p>
                </div>
              )}

              {hasActions && (
                <div className="space-y-8">
                  {/* Action Statistics */}
                  {Object.keys(groupedActions).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(groupedActions).map(([type, items], idx) => {
                        const badge = getActionBadge(type);
                        return (
                          <div
                            key={type}
                            className={`p-4 ${badge.bg} rounded-lg border border-border scale-in`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className="text-2xl font-bold mb-1">
                              {items.length}
                            </div>
                            <div className={`text-xs font-semibold ${badge.text}`}>
                              {badge.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions List */}
                  <div className="space-y-4">
                    {meeting.actions?.map((actionItem, index) => (
                      <ActionItemComponent
                        key={index}
                        actionItem={actionItem}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Transcript Tab */}
          {activeTab === "transcript" && (
            <>
              {meeting.transcript && meeting.transcript.length > 0 ? (
                <div className="space-y-6">
                  {meeting.transcript.map((segment, index) => (
                    <TranscriptSegmentComponent
                      key={index}
                      segment={segment}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 fade-in">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No Transcript Available
                  </h3>
                  <p className="text-muted-foreground">
                    The transcript for this meeting has not been generated yet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
