"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users,
  Copy,
  RefreshCw,
  Shield,
  UserMinus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Hash,
  Link as LinkIcon
} from 'lucide-react';

interface TeamMember {
  uid: string;
  email: string | null;
  name: string | null;
  isLeader: boolean;
}

interface TeamData {
  name: string;
  creatorId: string;
  members: string[];
  createdAt: any;
  inviteCode?: string;
  inviteCodeExpiresAt?: any;
}

// Helper function to generate 8-character alphanumeric invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded similar looking chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to get expiration date (7 days from now)
function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

export default function TeamPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  const isLeader = teamData?.creatorId === user?.uid;

  useEffect(() => {
    if (!authLoading && !userData?.teamId) {
      setLoading(false);
      return;
    }

    const fetchTeamData = async () => {
      if (!userData?.teamId) return;

      try {
        // Fetch team data
        const teamRef = doc(db, 'teams', userData.teamId);
        const teamSnap = await getDoc(teamRef);

        if (teamSnap.exists()) {
          const data = teamSnap.data() as TeamData;
          setTeamData(data);

          // Fetch member details
          const memberPromises = data.members.map(async (memberId) => {
            const userRef = doc(db, 'users', memberId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              return {
                uid: memberId,
                email: userData.email || null,
                name: userData.name || userData.displayName || null,
                isLeader: memberId === data.creatorId,
              };
            }
            return null;
          });

          const members = (await Promise.all(memberPromises)).filter(Boolean) as TeamMember[];
          setTeamMembers(members);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [userData?.teamId, authLoading]);

  const handleCopyCode = async () => {
    if (!teamData?.inviteCode) return;
    await navigator.clipboard.writeText(teamData.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    if (!userData?.teamId || !isLeader) return;

    setRegenerating(true);
    try {
      const newCode = generateInviteCode();
      const teamRef = doc(db, 'teams', userData.teamId);
      await updateDoc(teamRef, {
        inviteCode: newCode,
        inviteCodeExpiresAt: serverTimestamp(),
        inviteCodeUpdatedAt: serverTimestamp(),
      });

      setTeamData(prev => prev ? { ...prev, inviteCode: newCode } : null);
    } catch (error) {
      console.error('Error regenerating code:', error);
      alert('Failed to regenerate invite code. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!userData?.teamId || !isLeader || memberId === user?.uid) return;

    const confirmRemove = confirm('Are you sure you want to remove this team member?');
    if (!confirmRemove) return;

    setRemovingMember(memberId);
    try {
      const teamRef = doc(db, 'teams', userData.teamId);
      const updatedMembers = teamData!.members.filter(id => id !== memberId);

      await updateDoc(teamRef, {
        members: updatedMembers,
      });

      // Update user's teamId
      const userRef = doc(db, 'users', memberId);
      await updateDoc(userRef, {
        teamId: null,
      });

      // Update local state
      setTeamData(prev => prev ? { ...prev, members: updatedMembers } : null);
      setTeamMembers(prev => prev.filter(member => member.uid !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove team member. Please try again.');
    } finally {
      setRemovingMember(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData?.teamId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Team Found</h2>
          <p className="text-muted-foreground mb-6">
            You're not part of any team yet. Please complete the setup process to create or join a team.
          </p>
          <a href="/setup" className="btn-primary inline-flex items-center gap-2">
            <Users className="w-5 h-5" />
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Team Not Found</h2>
          <p className="text-muted-foreground">Unable to load team data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen font-sans page-transition">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 slide-in-down">
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage your team members and settings.</p>
        </header>

        <main className="max-w-4xl mx-auto space-y-6 fade-in">
          {/* Team Overview Card */}
          <div className="modern-card p-6 sm:p-8 slide-in-up stagger-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">{teamData.name}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Created {teamData.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{teamData.members.length} members</span>
                  </div>
                </div>
              </div>
              {isLeader && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Team Leader</span>
                </div>
              )}
            </div>

            {/* Invite Code Section - Visible to all members */}
            {teamData.inviteCode && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Invite Code
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isLeader
                    ? "Share this code with others to invite them to your team."
                    : "Share this code with others to invite them to join the team."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                    <LinkIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    <code className="flex-1 text-xl font-mono font-semibold text-foreground tracking-wider">
                      {teamData.inviteCode || 'GENERATING...'}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-card rounded-lg transition-colors"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                  </div>
                  {isLeader && (
                    <button
                      onClick={handleRegenerateCode}
                      disabled={regenerating}
                      className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Team Members Card */}
          <div className="modern-card p-6 sm:p-8 slide-in-up stagger-2">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({teamMembers.length})
            </h3>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {(member.name || member.email || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.name || 'Unnamed Member'}
                        {member.uid === user?.uid && (
                          <span className="ml-2 text-sm text-muted-foreground">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.isLeader ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Leader</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground px-3 py-1.5">Member</span>
                    )}
                    {isLeader && !member.isLeader && member.uid !== user?.uid && (
                      <button
                        onClick={() => handleRemoveMember(member.uid)}
                        disabled={removingMember === member.uid}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove member"
                      >
                        {removingMember === member.uid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
