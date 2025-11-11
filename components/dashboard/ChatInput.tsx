"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle message submission here
      console.log("Message sent:", message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end gap-3 p-4 bg-card border border-border rounded-3xl shadow-sm hover:border-border/80 focus-within:border-primary/50 transition-all">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Aerius..."
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground max-h-[200px] overflow-y-auto"
          style={{ minHeight: "24px" }}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="flex-shrink-0 p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm"
          aria-label="Send message"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
