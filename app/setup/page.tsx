"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { VoiceSetupStep } from "@/components/setup/VoiceSetup";
import { TeamSetupStep } from "@/components/setup/TeamSetup";
import { IntegrationsSetupStep } from "@/components/setup/IntegrationsSetup";
import { Loader2 } from "lucide-react";

// Define the steps for the setup wizard: team → voice (optional) → integrations (optional)
type SetupStep = "team" | "voice" | "integrations";

export default function SetupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<SetupStep>("team");
  const [teamId, setTeamId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if user already has a team
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.teamId) {
            setTeamId(userData.teamId);
            // If user has team, skip to voice setup
            setSetupStep("voice");
          }
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  if (loading || !user) {
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
        <VoiceSetupStep
          user={user}
          onComplete={handleVoiceComplete}
          onSkip={handleSkipVoice}
        />
      )}
      {setupStep === "integrations" && teamId && (
        <IntegrationsSetupStep user={user} teamId={teamId} />
      )}
    </div>
  );
}
