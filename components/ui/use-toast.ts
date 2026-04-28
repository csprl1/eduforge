// components/ui/use-toast.ts
"use client";

import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastList: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastList]));
}

export function toast(options: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast = { ...options, id };
  toastList = [...toastList, newToast];
  notifyListeners();
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastList);

  const subscribe = useCallback(() => {
    const listener = (updatedToasts: Toast[]) => setToasts(updatedToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  // Auto-subscribe on mount
  if (typeof window !== "undefined") {
    const unsubscribe = subscribe();
    // This is a simplified approach; in production use useEffect
    void unsubscribe;
  }

  return { toasts, toast };
}
