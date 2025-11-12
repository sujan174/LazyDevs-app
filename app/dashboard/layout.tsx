"use client";

import { useState, useEffect, ReactNode, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Loader2 } from "lucide-react";
import { useUploadModal } from "@/contexts/UploadModalProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load the UploadModal for better performance
const UploadModal = lazy(() =>
  import("@/components/modals/UploadModal").then((mod) => ({
    default: mod.UploadModal,
  }))
);

// Helper component to render the modal with lazy loading
function DashboardModalController() {
  const { isUploadModalOpen } = useUploadModal();
  const { user } = useAuth();

  if (!isUploadModalOpen || !user) return null;

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
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  // Handle redirects in useEffect to avoid rendering errors
  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect to setup if user doesn't have a team
    if (userData && !userData.teamId) {
      router.push("/setup");
      return;
    }
  }, [user, userData, loading, router]);

  if (loading) {
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
    <ErrorBoundary>
      <div className="flex h-screen bg-background fade-in">
        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar - responsive */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main content area with responsive margins */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}
            ml-0`}
        >
          <Header
            user={user!}
            toggleSidebar={() => {
              // On mobile, toggle mobile sidebar
              // On desktop, toggle collapse
              if (window.innerWidth < 768) {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              } else {
                setSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
          />
          <main className="flex-1 overflow-y-auto page-transition">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

        {/* Lazy-loaded modal component */}
        <DashboardModalController />
      </div>
    </ErrorBoundary>
  );
}

