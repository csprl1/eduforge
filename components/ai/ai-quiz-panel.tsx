// components/ai/ai-quiz-panel.tsx
"use client";

import { useState } from "react";
import { Brain, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

interface AiQuizPanelProps {
  lessonId: string;
  courseId: string;
}

type QuizState = "idle" | "generating" | "ready" | "complete";

export function AiQuizPanel({ lessonId, courseId }: AiQuizPanelProps) {
  const [state, setState] = useState<QuizState>("idle");
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    if (state === "ready" || state === "complete") {
      setOpen(!open);
      return;
    }
    setState("generating");
    setOpen(true);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId, numQuestions: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.data.questions);
      setState("ready");
      setAnswers({});
      setSubmitted(false);
    } catch {
      toast({ title: "Failed to generate quiz", variant: "destructive" });
      setState("idle");
      setOpen(false);
    }
  };

  const selectAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    setState("complete");
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setState("ready");
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="forge-card overflow-hidden border-purple-500/20">
      <button
        onClick={generateQuiz}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">AI Quiz</p>
            <p className="text-xs text-slate-500">Test your knowledge</p>
          </div>
        </div>
        {state === "generating" ? (
          <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
        ) : open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/5">
          {state === "generating" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              <p className="text-sm text-slate-400">Generating quiz with AI...</p>
            </div>
          )}

          {(state === "ready" || state === "complete") && questions.length > 0 && (
            <div className="p-4 space-y-5">
              {/* Score banner */}
              {submitted && (
                <div
                  className={cn(
                    "rounded-xl p-4 text-center border",
                    score >= 80
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : score >= 60
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  )}
                >
                  <Trophy
                    className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"
                    )}
                  />
                  <p className="text-2xl font-bold text-white">{score}%</p>
                  <p className={cn("text-sm", score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400")}>
                    {score >= 80 ? "Excellent! 🎉" : score >= 60 ? "Good effort! 👍" : "Keep studying 📚"}
                  </p>
                </div>
              )}

              {/* Questions */}
              {questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-semibold text-white">
                    <span className="text-slate-500 font-normal">{qIdx + 1}. </span>
                    {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[qIdx] === optIdx;
                      const isCorrect = q.correctAnswer === optIdx;
                      let optStyle = "border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/40 hover:bg-purple-500/5";
                      if (submitted) {
                        if (isCorrect) optStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                        else if (isSelected && !isCorrect) optStyle = "border-red-500/40 bg-red-500/10 text-red-300";
                        else optStyle = "border-white/5 bg-white/[0.02] text-slate-500";
                      } else if (isSelected) {
                        optStyle = "border-purple-500 bg-purple-500/10 text-purple-200";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectAnswer(qIdx, optIdx)}
                          disabled={submitted}
                          className={cn(
                            "w-full text-left px-3.5 py-2.5 rounded-lg border text-sm transition-all flex items-center justify-between gap-2",
                            optStyle
                          )}
                        >
                          <span>{opt}</span>
                          {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                          {submitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {/* Explanation after submit */}
                  {submitted && (
                    <div className="px-3.5 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300">
                      <span className="font-semibold">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!submitted ? (
                  <Button
                    className="flex-1"
                    onClick={submitQuiz}
                    disabled={!allAnswered}
                    variant={allAnswered ? "default" : "outline"}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={resetQuiz} className="gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                    <Button
                      className="flex-1 gap-1.5"
                      onClick={async () => {
                        setState("idle");
                        setOpen(false);
                        await new Promise((r) => setTimeout(r, 100));
                        generateQuiz();
                      }}
                    >
                      <Brain className="h-3.5 w-3.5" />
                      New Quiz
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {state === "idle" && !open && (
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-600 text-center">Click above to generate a new AI quiz</p>
        </div>
      )}
    </div>
  );
}
