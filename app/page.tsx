"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user && userData) {
      // A user is fully set up if their document exists AND they have a teamId
      if (userData.teamId) {
        // User is fully onboarded, send them to the real dashboard
        router.push("/dashboard");
      } else {
        // User profile is incomplete, send them to the setup wizard
        router.push("/setup");
      }
    } else {
      // User is not logged in, send them to the login page
      router.push("/login");
    }
  }, [user, userData, loading, router]);

  // This page will only ever show a loading screen while it determines where to redirect the user.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-lg font-medium text-gray-600">Loading your space...</p>
      </div>
    </div>
  );
}

