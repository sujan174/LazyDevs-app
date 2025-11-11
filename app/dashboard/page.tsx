"use client";
import { ChatInput } from "../../components/dashboard/ChatInput";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="h-full p-6 sm:p-8 page-transition">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Main Chat Card */}
        <div className="flex-1 flex flex-col modern-card slide-in-up overflow-hidden">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {/* Empty State */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl px-4 fade-in-scale">
                <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-2xl">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  How can I help you today?
                </h2>
                <p className="text-base text-muted-foreground">
                  I can help you analyze meetings, track action items, and answer questions about your transcripts.
                </p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border/60 p-4 sm:p-6 bg-muted/20">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}
