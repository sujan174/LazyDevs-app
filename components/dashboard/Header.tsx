"use client";

import { User } from "firebase/auth";
import { Menu } from "lucide-react";

interface HeaderProps {
  user: User;
  toggleSidebar: () => void;
}

export function Header({ user, toggleSidebar }: HeaderProps) {
  return (
    <header className="h-20 bg-card/30 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-8 flex-shrink-0 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>

      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* User info section - can be expanded later */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-semibold text-sm">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}
