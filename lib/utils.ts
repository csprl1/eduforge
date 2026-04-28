// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const COURSE_CATEGORIES = [
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "AI_ML", label: "AI & Machine Learning" },
  { value: "DESIGN", label: "Design" },
  { value: "BUSINESS", label: "Business" },
  { value: "MARKETING", label: "Marketing" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "MOBILE", label: "Mobile Development" },
  { value: "OTHER", label: "Other" },
] as const;

export const COURSE_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  WEB_DEVELOPMENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DATA_SCIENCE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  AI_ML: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DESIGN: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  BUSINESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MARKETING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DEVOPS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MOBILE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-400 border-green-500/20",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ADVANCED: "bg-red-500/10 text-red-400 border-red-500/20",
};
