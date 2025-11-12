"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import {
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Importing icons
import { Loader2, Users, UserPlus, XCircle } from "lucide-react";

// Helper function to generate 8-character alphanumeric invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded similar looking chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
      const inviteCode = generateInviteCode();
      const teamCollectionRef = collection(db, "teams");
      const newTeamDoc = await addDoc(teamCollectionRef, {
        name: teamName,
        creatorId: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp(),
        inviteCode: inviteCode,
        inviteCodeExpiresAt: serverTimestamp(),
        inviteCodeUpdatedAt: serverTimestamp(),
      });
      const userDocRef = doc(db, "users", user.uid);
      // Use setDoc with merge to create document if it doesn't exist
      await setDoc(userDocRef, { teamId: newTeamDoc.id }, { merge: true });

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
    try {
      const inviteCode = joinTeamId.trim().toUpperCase();

      // Query teams collection for matching invite code
      const teamsRef = collection(db, "teams");
      const q = query(teamsRef, where("inviteCode", "==", inviteCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid invite code. Please check and try again.");
      }

      // Get the first matching team
      const teamDoc = querySnapshot.docs[0];
      const teamData = teamDoc.data();

      // Check if user is already a member
      if (teamData.members && teamData.members.includes(user.uid)) {
        throw new Error("You are already a member of this team.");
      }

      // Add user to team
      const teamDocRef = doc(db, "teams", teamDoc.id);
      await updateDoc(teamDocRef, { members: arrayUnion(user.uid) });

      // Update user document
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { teamId: teamDoc.id }, { merge: true });

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
    <div className="modern-card p-8 w-full max-w-lg fade-in-scale">
      {/* Wizard Header */}
      <div className="text-center mb-8 slide-in-down">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
          STEP 1 OF 3
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Join or Create a Team
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new team to get an invite code, or join with an existing code.
        </p>
      </div>

      {/* Create Team Form */}
      <form onSubmit={handleCreateTeam} className="space-y-5 mb-6 slide-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Create a New Team
          </h2>
        </div>
        <div className="space-y-2">
          <label htmlFor="team-name" className="text-sm font-medium text-foreground block">
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
        <button type="submit" className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || !teamName.trim()}>
          {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating...</> : "Create Team"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-4 items-center slide-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">OR</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Join Team Form */}
      <form onSubmit={handleJoinTeam} className="space-y-5 mt-6 slide-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Join an Existing Team
          </h2>
        </div>
        <div className="space-y-2">
          <label htmlFor="team-id" className="text-sm font-medium text-foreground block">
            Invite Code
          </label>
          <input
            id="team-id"
            type="text"
            className="input-field"
            placeholder="Enter 8-character invite code"
            value={joinTeamId}
            onChange={(e) => setJoinTeamId(e.target.value)}
            required
            disabled={isSubmitting}
            maxLength={8}
          />
        </div>
        <button type="submit" className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || !joinTeamId.trim()}>
          {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Joining...</> : "Join Team"}
        </button>
      </form>

      {/* Error Display */}
       {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive slide-in-up">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
        )}
    </div>
  );
}

