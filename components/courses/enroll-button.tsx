// components/courses/enroll-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toaster";
import { BookOpen, CheckCircle2, Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  progress?: number;
}

export function EnrollButton({ courseId, isEnrolled, progress = 0 }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Enrollment failed", variant: "destructive" });
        return;
      }
      setEnrolled(true);
      toast({ title: "Enrolled successfully!", description: "Start learning now.", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Enrolled
          </span>
          <span className="font-mono">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        <Button className="w-full" size="lg" variant="glow">
          <BookOpen className="h-4 w-4" />
          {progress > 0 ? "Continue Learning" : "Start Learning"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      variant="glow"
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <BookOpen className="h-4 w-4" />
          Enroll for Free
        </>
      )}
    </Button>
  );
}
