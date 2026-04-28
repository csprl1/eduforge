// app/loading.tsx
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 animate-pulse-slow">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="space-y-2 text-center">
          <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
