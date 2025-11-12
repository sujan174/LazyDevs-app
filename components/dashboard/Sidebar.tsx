"use client";

import { LogOut, Settings, LayoutDashboard, User, DoorOpen, Upload, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isCollapsed, isMobileOpen = false, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    const handleLinkClick = () => {
      // Close mobile sidebar when navigating
      if (onMobileClose && window.innerWidth < 768) {
        onMobileClose();
      }
    };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Meetings", href: "/dashboard/meetings", icon: Calendar },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-card/50 backdrop-blur-xl border-r border-border/50 text-foreground flex flex-col transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        ${isMobileOpen ? "translate-x-0 w-64 slide-in-left" : "-translate-x-full md:translate-x-0"}
        md:w-${isCollapsed ? "20" : "64"}
      `}
    >
      <div className="h-20 flex items-center justify-center border-b border-border/50 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>

        {/* Full logo - always show on mobile */}
        <div className={`relative z-10 flex items-center gap-2 transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 opacity-100' : 'opacity-100'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
            Aerius
          </span>
        </div>

        {/* Collapsed logo - only on desktop */}
        <div className={`absolute left-1/2 -translate-x-1/2 z-10 transition-opacity duration-300 hidden md:block ${isCollapsed ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">A</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={handleLinkClick}
            className={`flex items-center p-3 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-all duration-200 group relative overflow-hidden slide-in-up stagger-${index + 1}`}
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <item.icon className="w-5 h-5 flex-shrink-0 relative z-10 group-hover:text-primary transition-colors" />
            <span
              className={`ml-4 font-medium transition-all duration-200 relative z-10 ${
                isCollapsed ? "md:opacity-0 md:-translate-x-3 md:w-0 opacity-100 translate-x-0 w-auto" : "opacity-100 translate-x-0 w-auto"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border/50 space-y-2">
        <Link
            href="#" // Future link to /account
            onClick={handleLinkClick}
            className="w-full flex items-center p-3 min-h-[48px] text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-all duration-200 group"
        >
          <User className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className={`ml-4 font-medium transition-all duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 opacity-100 w-auto' : 'opacity-100 w-auto'}`}>
            Account
          </span>
        </Link>
        <button
          // onClick handler for leaving a team would be added here
          className="w-full flex items-center p-3 min-h-[48px] text-muted-foreground hover:bg-warning/10 hover:text-warning rounded-lg transition-all duration-200 group"
        >
          <DoorOpen className="w-5 h-5" />
          <span className={`ml-4 font-medium transition-all duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 opacity-100 w-auto' : 'opacity-100 w-auto'}`}>
            Leave Team
          </span>
        </button>
        <button
          onClick={() => {
            handleSignOut();
            handleLinkClick();
          }}
          className="w-full flex items-center p-3 min-h-[48px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className={`ml-4 font-medium transition-all duration-200 ${isCollapsed ? 'md:opacity-0 md:w-0 opacity-100 w-auto' : 'opacity-100 w-auto'}`}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

