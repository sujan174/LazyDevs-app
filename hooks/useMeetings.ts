"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

export interface Meeting {
  id: string;
  title: string;
  createdAt: Timestamp;
  durationMs: number;
}

const MEETINGS_PER_PAGE = 20;

/**
 * Custom hook for fetching and subscribing to meetings with pagination
 * @param user - The authenticated user
 * @param pageSize - Number of meetings per page (default: 20)
 * @returns {Object} Contains meetings array, loading and error states, and pagination functions
 */
export function useMeetings(user: User | null, pageSize: number = MEETINGS_PER_PAGE) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    if (!user) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    let unsubscribeSnapshot: (() => void) | undefined;

    const fetchTeamAndMeetings = async () => {
      try {
        setLoading(true);
        setError(null);

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.warn("User document not found");
          setMeetings([]);
          setLoading(false);
          return;
        }

        const teamId = userDoc.data()?.teamId;

        if (!teamId) {
          console.warn("User has no teamId assigned");
          setMeetings([]);
          setLoading(false);
          return;
        }

        console.log("Fetching meetings for teamId:", teamId);

        const meetingsRef = collection(db, "meetings");
        const q = query(
          meetingsRef,
          where("teamId", "==", teamId),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );

        unsubscribeSnapshot = onSnapshot(
          q,
          (querySnapshot) => {
            console.log(`Found ${querySnapshot.docs.length} meetings for team`);

            const meetingsData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Meeting[];

            setMeetings(meetingsData);

            // Track the last document for pagination
            if (querySnapshot.docs.length > 0) {
              setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
            }

            // Check if there are more meetings
            setHasMore(querySnapshot.docs.length === pageSize);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching meetings:", err);

            if (err.message.includes("index")) {
              setError("Database index required. Check console for setup link.");
              console.error(
                "🔥 FIRESTORE INDEX REQUIRED 🔥\n" +
                  "You need to create a composite index in Firestore.\n" +
                  "The error message above should contain a link to create it automatically.\n" +
                  "Or manually create an index for collection 'meetings':\n" +
                  "- Field: teamId (Ascending)\n" +
                  "- Field: createdAt (Descending)"
              );
            } else {
              setError("Failed to load meetings. Please try again.");
            }

            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error in fetchTeamAndMeetings:", err);
        setError("Failed to initialize meetings");
        setLoading(false);
      }
    };

    fetchTeamAndMeetings();

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [user, pageSize]);

  // Load more meetings
  const loadMore = useCallback(async () => {
    if (!user || !lastDoc || !hasMore || loading) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const teamId = userDoc.data()?.teamId;

      if (!teamId) return;

      const meetingsRef = collection(db, "meetings");
      const q = query(
        meetingsRef,
        where("teamId", "==", teamId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );

      const snapshot = await getDocs(q);

      if (snapshot.docs.length > 0) {
        const newMeetings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Meeting[];

        setMeetings((prev) => [...prev, ...newMeetings]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more meetings:", err);
    }
  }, [user, lastDoc, hasMore, loading, pageSize]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({ meetings, loading, error, hasMore, loadMore }),
    [meetings, loading, error, hasMore, loadMore]
  );
}
