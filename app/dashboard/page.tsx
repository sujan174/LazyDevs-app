"use client";
import { ChatInput } from "../../components/dashboard/ChatInput";
import { MeetingsPane } from "../../components/dashboard/MeetingsPane";
import { MessageSquare, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="h-full flex p-6 gap-6 fade-in">
      {/* Main Content Area (Chatbot) */}
      <div className="flex-1 flex flex-col modern-card overflow-hidden slide-in-up">
        <header className="p-6 border-b border-border bg-gradient-accent">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about your meetings
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Empty state with better visuals */}
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md scale-in">
              <div className="mb-6 inline-flex p-5 bg-gradient-accent rounded-2xl ring-1 ring-primary/10 pulse-glow">
                <Sparkles className="w-14 h-14 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Start a conversation
              </h2>
              <p className="text-muted-foreground mb-8 text-base">
                Ask me anything about your meetings, transcripts, or action items.
                I'm here to help you stay organized.
              </p>
              <div className="grid gap-3 text-left">
                <div className="p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    💡 "Summarize my last meeting"
                  </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    📋 "What action items do I have?"
                  </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card/50 backdrop-blur-sm group">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    🔍 "Find discussions about project timeline"
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

      {/* Right Meetings Pane */}
      <MeetingsPane />
    </div>
  );
}
