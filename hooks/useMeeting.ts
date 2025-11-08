"use client";

import { useState, useEffect, useMemo } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface TranscriptSegment {
  speaker: string;
  text: string;
  start_ms: number;
  end_ms: number;
}

export interface ActionItem {
  action: "create" | "update" | "comment" | "close" | "flag" | "meta";
  id?: string;
  data: {
    task_name?: string;
    list_id?: string;
    description?: string;
    assignees?: number[];
    status?: string;
    priority?: number;
    due_date?: string;
    tags?: string[];
    custom_fields?: Array<{ id: string; value: any }>;
    updates?: {
      name?: string;
      description?: string;
      status?: string;
      assignees?: number[];
      priority?: number;
      due_date?: string;
    };
    dependencies?: {
      add?: string[];
      remove?: string[];
    };
    comment?: string;
    summary?: string;
    context?: string;
    parties?: string[];
    type?: string;
    name?: string;
    details?: string;
  };
  reasoning?: string;
}

export interface Meeting {
  id: string;
  title: string;
  transcript: TranscriptSegment[];
  speakerMap: Record<string, string>;
  unresolvedSpeakers: Array<{ label: string; audio_snippet_b64: string }>;
  createdAt: any;
  durationMs: number;
  totalSegments: number;
  totalSpeakers: number;
  unresolvedCount: number;
  status?: "processing" | "transcribed" | "resolving" | "completed";
  actions?: ActionItem[];
}

/**
 * Custom hook for fetching and subscribing to a single meeting
 * @param meetingId - The ID of the meeting to fetch
 * @returns {Object} Contains meeting data, loading and error states
 */
export function useMeeting(meetingId: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setError("No meeting ID provided");
      setLoading(false);
      return;
    }

    const meetingRef = doc(db, "meetings", meetingId);
    const unsubscribe = onSnapshot(
      meetingRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMeeting({ id: doc.id, ...data } as Meeting);
          setError(null);
        } else {
          setError("Meeting not found.");
          setMeeting(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching meeting in real-time:", err);
        setError("Failed to load meeting data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [meetingId]);

  return useMemo(
    () => ({ meeting, loading, error }),
    [meeting, loading, error]
  );
}
