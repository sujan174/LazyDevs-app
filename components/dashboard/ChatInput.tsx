"use client";

import { useState } from "react";
import { Send, Paperclip } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle message submission here
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? "scale-[1.01]" : ""
        }`}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask me anything about your meetings..."
          className="w-full pl-12 pr-24 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200 placeholder:text-muted-foreground text-foreground"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <button
            type="button"
            className="p-1 rounded-full text-muted-foreground hover:text-primary transition-colors btn-smooth"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-smooth"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </form>
  );
}
