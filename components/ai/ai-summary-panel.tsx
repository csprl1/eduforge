// components/ai/ai-summary-panel.tsx
"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import ReactMarkdown from "react-markdown";

interface AiSummaryPanelProps {
  lessonId: string;
}

export function AiSummaryPanel({ lessonId }: AiSummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const generateSummary = async () => {
    if (summary) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.data.summary);
      setOpen(true);
    } catch (err) {
      toast({ title: "Failed to generate summary", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forge-card overflow-hidden border-indigo-500/20">
      <button
        onClick={generateSummary}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">AI Summary</p>
            <p className="text-xs text-slate-500">Key takeaways from this lesson</p>
          </div>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
        ) : open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && summary && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4">
          <div className="text-sm text-slate-300 leading-relaxed space-y-2">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-sm text-slate-300 mb-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-sm text-slate-300">{children}</ul>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {!summary && !loading && (
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-600 text-center">Click above to generate an AI summary</p>
        </div>
      )}
    </div>
  );
}
