"use client";
import { ChatInput } from "../../components/dashboard/ChatInput";

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          {/* Simple Empty State - Claude style */}
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-2xl px-4">
              <h2 className="text-2xl font-normal text-foreground mb-3">
                How can I help you today?
              </h2>
              <p className="text-base text-muted-foreground">
                I can help you analyze meetings, track action items, and answer questions about your transcripts.
              </p>
            </div>
          </div>
        </div>

        {/* Simple Input Area - Claude style */}
        <div className="px-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}
