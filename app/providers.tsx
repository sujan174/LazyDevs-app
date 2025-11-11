"use client";

import { AuthProvider } from "@/contexts/AuthProvider";
import { UploadModalProvider } from "@/contexts/UploadModalProvider";
import { ReactNode } from "react";

// This component's only job is to wrap children with all the necessary client-side providers.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UploadModalProvider>
        {children}
      </UploadModalProvider>
    </AuthProvider>
  );
}

