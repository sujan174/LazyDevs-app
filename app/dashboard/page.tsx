"use client";
import { ChatInput } from "../../components/dashboard/ChatInput";
import { MessageSquare, Sparkles, Calendar, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="h-full p-6 sm:p-8 overflow-y-auto page-transition">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Welcome Header */}
        <div className="mb-8 slide-in-down">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Aerius
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered meeting intelligence platform
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/meetings" className="group">
            <div className="modern-card p-6 cursor-pointer slide-in-up stagger-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Total Meetings</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="modern-card p-6 slide-in-up stagger-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl ring-1 ring-accent/20">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0h</p>
                <p className="text-sm text-muted-foreground">Time Saved</p>
              </div>
            </div>
          </div>

          <div className="modern-card p-6 slide-in-up stagger-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl ring-1 ring-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Action Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main AI Chat Interface */}
        <div className="flex-1 flex flex-col modern-card overflow-hidden slide-in-up stagger-4 min-h-0">
          <header className="p-6 border-b border-border bg-gradient-accent">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  AI Assistant
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your meetings
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Empty state with better visuals */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl scale-in">
                <div className="mb-8 inline-flex p-6 bg-gradient-accent rounded-3xl ring-1 ring-primary/10 pulse-glow">
                  <Sparkles className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Start a conversation
                </h3>
                <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto">
                  Ask me anything about your meetings, transcripts, or action items.
                  I'm here to help you stay organized and productive.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="p-5 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group text-left">
                    <div className="text-2xl mb-2">💡</div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      Summarize meetings
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Get quick insights from your meetings
                    </p>
                  </div>
                  <div className="p-5 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group text-left">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      Track action items
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Never miss a follow-up task
                    </p>
                  </div>
                  <div className="p-5 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group text-left">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      Search discussions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Find key moments instantly
                    </p>
                  </div>
                  <div className="p-5 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group text-left">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                      Generate insights
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Discover patterns and trends
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-gradient-accent p-4 sm:p-6">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}
