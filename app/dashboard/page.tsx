"use client";
import { ChatInput } from "../../components/dashboard/ChatInput";
import { MeetingsPane } from "../../components/dashboard/MeetingsPane";
import { MessageSquare, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="h-full flex p-6 gap-6 fade-in">
      {/* Main Content Area (Chatbot) */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border shadow-sm slide-in-up gradient-bg overflow-hidden">
        <header className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
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
            <div className="text-center max-w-md fade-in">
              <div className="mb-4 inline-flex p-4 bg-primary/5 rounded-full">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Start a conversation
              </h2>
              <p className="text-muted-foreground mb-6">
                Ask me anything about your meetings, transcripts, or action items.
                I'm here to help you stay organized.
              </p>
              <div className="grid gap-2 text-left">
                <div className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card">
                  <p className="text-sm font-medium text-card-foreground">
                    💡 "Summarize my last meeting"
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card">
                  <p className="text-sm font-medium text-card-foreground">
                    📋 "What action items do I have?"
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer card-hover bg-card">
                  <p className="text-sm font-medium text-card-foreground">
                    🔍 "Find discussions about project timeline"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-b-xl">
          <ChatInput />
        </div>
      </div>

      {/* Right Meetings Pane */}
      <MeetingsPane />
    </div>
  );
}
