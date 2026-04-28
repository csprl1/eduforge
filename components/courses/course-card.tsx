import Link from "next/link";
import {
  Star,
  Users,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CATEGORY_COLORS,
  LEVEL_COLORS,
  getInitials,
  truncate,
} from "@/lib/utils";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    category: string;
    level: string;
    isEnrolled?: boolean;
    averageRating?: number;
    author: {
      name?: string | null;
      image?: string | null;
    };
    _count: {
      lessons: number;
      enrollments: number;
      reviews: number;
    };
  };
  animationDelay?: number;
}

export function CourseCard({
  course,
  animationDelay = 0,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="forge-card group flex flex-col overflow-hidden animate-slide-up"
      style={{
        animationDelay: `${animationDelay}s`,
        opacity: 0,
        animationFillMode: "forwards",
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-600/20 to-purple-600/10">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-indigo-500/30" />
          </div>
        )}

        {course.isEnrolled && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-semibold text-white">
            <CheckCircle2 className="h-3 w-3" />
            Enrolled
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
              CATEGORY_COLORS[
                course.category as keyof typeof CATEGORY_COLORS
              ] ?? ""
            }`}
          >
            {course.category.replace("_", " ")}
          </span>

          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
              LEVEL_COLORS[
                course.level as keyof typeof LEVEL_COLORS
              ] ?? ""
            }`}
          >
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-indigo-300">
          {course.title}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
          {truncate(course.description, 100)}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={course.author.image ?? ""}
              />
              <AvatarFallback className="text-[9px]">
                {getInitials(
                  course.author.name ?? "U"
                )}
              </AvatarFallback>
            </Avatar>

            <span className="max-w-[80px] truncate text-xs text-slate-500">
              {course.author.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course._count.lessons}
            </span>

            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course._count.enrollments}
            </span>

            {course.averageRating &&
            course.averageRating > 0 ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                {course.averageRating.toFixed(
                  1
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}