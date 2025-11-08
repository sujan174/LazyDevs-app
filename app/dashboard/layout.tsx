"use client";

import { useState, useEffect, ReactNode, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Loader2 } from "lucide-react";
import { useUploadModal } from "@/contexts/UploadModalProvider";

// Lazy load the UploadModal for better performance
const UploadModal = lazy(() =>
  import("@/components/modals/UploadModal").then((mod) => ({
    default: mod.UploadModal,
  }))
);

// Helper component to render the modal with lazy loading
function DashboardModalController({ user }: { user: User }) {
  const { isUploadModalOpen } = useUploadModal();

  if (!isUploadModalOpen) return null;

  // Render the lazy-loaded UploadModal with a fallback loader
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <UploadModal user={user} />
    </Suspense>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading your space...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background fade-in">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header
          user={user}
          toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {/* Lazy-loaded modal component */}
      <DashboardModalController user={user} />
    </div>
  );
}

