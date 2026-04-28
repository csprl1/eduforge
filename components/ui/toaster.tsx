// components/ui/toaster.tsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastList: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((l) => l([...toastList]));
}

export function toast(options: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastList = [...toastList, { ...options, id }];
  notifyListeners();
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    notifyListeners();
  }, 4500);
  return id;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (updated: Toast[]) => setToasts(updated);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = (id: string) => {
    toastList = toastList.filter((t) => t.id !== id);
    notifyListeners();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-sm animate-slide-up",
            t.variant === "destructive"
              ? "border-red-500/30 bg-red-950/80 text-red-200"
              : t.variant === "success"
              ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
              : "border-white/10 bg-slate-900/90 text-slate-200"
          )}
        >
          {t.variant === "destructive" ? (
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          ) : t.variant === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && (
              <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
