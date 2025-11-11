"use client";
import { ChatInput } from "../../components/dashboard/ChatInput";
import { Sparkles, Wand2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col page-transition">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Main AI Chat Interface - Beautiful & Minimal */}
        <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-xl border border-border rounded-3xl shadow-sm overflow-hidden slide-in-up">
          {/* Elegant Header */}
          <header className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary/3 via-accent/3 to-transparent flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl"></div>
                <div className="relative p-3 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl shadow-lg">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  AI Assistant
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your intelligent meeting companion
                </p>
              </div>
            </div>
          </header>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
            {/* Beautiful Empty State */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-3xl fade-in-scale">
                {/* Animated gradient icon */}
                <div className="mb-10 relative inline-flex">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/40 to-primary/40 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 p-8 rounded-full border border-primary/20 shadow-xl">
                    <Sparkles className="w-16 h-16 text-primary" />
                  </div>
                </div>

                {/* Elegant heading with gradient */}
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  How can I help you today?
                </h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Ask me anything about your meetings, transcripts, action items, or insights.
                  I'm here to make your work effortless.
                </p>

                {/* Beautiful suggestion cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-2xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          Summarize meetings
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Get instant summaries and key takeaways
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/60 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 text-left hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                          Track action items
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Never miss important follow-ups
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/60 hover:border-success/40 hover:shadow-lg hover:shadow-success/5 transition-all duration-300 text-left hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-success/10 to-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-success transition-colors">
                          Search discussions
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Find key moments in seconds
                        </p>
                      </div>
                    </div>
                  </button>

                  <button className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/60 hover:border-warning/40 hover:shadow-lg hover:shadow-warning/5 transition-all duration-300 text-left hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-warning/10 to-accent/10 rounded-xl group-hover:scale-110 transition-transform">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-warning transition-colors">
                          Generate insights
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Discover patterns and trends
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area with subtle gradient */}
          <div className="border-t border-border/60 bg-gradient-to-b from-transparent to-muted/20 p-4 sm:p-6 flex-shrink-0">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}
