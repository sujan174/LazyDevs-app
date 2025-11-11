"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { TeamSetupStep } from "@/components/setup/TeamSetup";
import { Loader2 } from "lucide-react";

// Lazy load heavy optional components for better initial load performance
const VoiceSetupStep = lazy(() =>
  import("@/components/setup/VoiceSetup").then((mod) => ({
    default: mod.VoiceSetupStep,
  }))
);
const IntegrationsSetupStep = lazy(() =>
  import("@/components/setup/IntegrationsSetup").then((mod) => ({
    default: mod.IntegrationsSetupStep,
  }))
);

// Define the steps for the setup wizard: team → voice (optional) → integrations (optional)
type SetupStep = "team" | "voice" | "integrations";

export default function SetupPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [setupStep, setSetupStep] = useState<SetupStep>("team");
  const [teamId, setTeamId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user already has a team
    if (userData?.teamId) {
      setTeamId(userData.teamId);
      // If user has team, skip to voice setup
      setSetupStep("voice");
    }
  }, [user, userData, authLoading, router]);

  const handleTeamComplete = (newTeamId: string) => {
    setTeamId(newTeamId);
    setSetupStep("voice");
  };

  const handleVoiceComplete = () => {
    setSetupStep("integrations");
  };

  const handleSkipVoice = () => {
    setSetupStep("integrations");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-opacity duration-500 ease-in-out">
      {setupStep === "team" && (
        <TeamSetupStep user={user} onComplete={handleTeamComplete} />
      )}
      {setupStep === "voice" && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          }
        >
          <VoiceSetupStep
            user={user}
            onComplete={handleVoiceComplete}
            onSkip={handleSkipVoice}
          />
        </Suspense>
      )}
      {setupStep === "integrations" && teamId && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          }
        >
          <IntegrationsSetupStep user={user} teamId={teamId} />
        </Suspense>
      )}
    </div>
  );
}
