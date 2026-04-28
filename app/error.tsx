// app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-red-600/20 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-slate-500 mb-6 max-w-sm">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={reset} variant="glow">Try again</Button>
    </div>
  );
}
