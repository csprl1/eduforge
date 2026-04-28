// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="text-7xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-3">Page not found</h2>
        <p className="text-slate-500 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="glow">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    </div>
  );
}
