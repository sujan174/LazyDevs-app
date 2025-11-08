"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import {
  doc,
  addDoc,
  getDoc,
  updateDoc,
  collection,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Importing icons
import { Loader2, Users, UserPlus, XCircle } from "lucide-react";

interface TeamSetupStepProps {
  user: User;
  onComplete: (teamId: string) => void;
}

export function TeamSetupStep({ user, onComplete }: TeamSetupStepProps) {
  const [teamName, setTeamName] = useState("");
  const [joinTeamId, setJoinTeamId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teamName.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const teamCollectionRef = collection(db, "teams");
      const newTeamDoc = await addDoc(teamCollectionRef, {
        name: teamName,
        creatorId: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp(),
      });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { teamId: newTeamDoc.id });

      // Call the onComplete callback to continue to next step
      onComplete(newTeamDoc.id);

    } catch (err) {
      console.error(err);
      setError("Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinTeamId.trim()) return;
    setError(null);
    setIsSubmitting(true);
    const teamDocRef = doc(db, "teams", joinTeamId.trim());
    try {
      const teamDoc = await getDoc(teamDocRef);
      if (!teamDoc.exists()) throw new Error("Team ID not found.");
      await updateDoc(teamDocRef, { members: arrayUnion(user.uid) });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { teamId: teamDoc.id });

      // Call the onComplete callback to continue to next step
      onComplete(teamDoc.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to join team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Otherwise, show the original create/join form
  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-100 transition-all duration-300 ease-in-out">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-indigo-600">STEP 1 OF 3</p>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
          Join or Create a Team
        </h1>
        <p className="text-gray-500 mt-2">
          Create a new team to get an ID, or join with an existing ID.
        </p>
      </div>

      {/* Create Team Form */}
      <form onSubmit={handleCreateTeam} className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Users className="w-5 h-5 mr-3 text-indigo-600" />
          Create a New Team
        </h2>
        <div className="space-y-2">
          <label htmlFor="team-name" className="text-sm font-medium text-gray-700 block pl-1">
            Team Name
          </label>
          <input
            id="team-name"
            type="text"
            className="input-field"
            placeholder="e.g., The A-Team"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50" disabled={isSubmitting || !teamName.trim()}>
          {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating...</> : "Create Team"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Join Team Form */}
      <form onSubmit={handleJoinTeam} className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <UserPlus className="w-5 h-5 mr-3 text-indigo-600" />
          Join an Existing Team
        </h2>
        <div className="space-y-2">
          <label htmlFor="team-id" className="text-sm font-medium text-gray-700 block pl-1">
            Team ID
          </label>
          <input
            id="team-id"
            type="text"
            className="input-field"
            placeholder="Enter Team ID from your admin"
            value={joinTeamId}
            onChange={(e) => setJoinTeamId(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50" disabled={isSubmitting || !joinTeamId.trim()}>
          {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Joining...</> : "Join Team"}
        </button>
      </form>

      {/* Error Display */}
       {error && (
            <p className="text-red-600 text-sm text-center mt-6 flex items-center justify-center">
              <XCircle className="w-4 h-4 mr-1.5" /> {error}
            </p>
        )}
    </div>
  );
}

