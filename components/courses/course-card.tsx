// components/courses/course-card.tsx
import Link from "next/link";
import { Star, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORY_COLORS, LEVEL_COLORS, getInitials, truncate } from "@/lib/utils";
import type { CourseWithAuthorAndCounts } from "@/types";

interface CourseCardProps {
  course: CourseWithAuthorAndCounts & { averageRating?: number; isEnrolled?: boolean };
  animationDelay?: number;
}

export function CourseCard({ course, animationDelay = 0 }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="forge-card flex flex-col overflow-hidden group animate-slide-up"
      style={{ animationDelay: `${animationDelay}s`, opacity: 0, animationFillMode: "forwards" }}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-indigo-500/30" />
          </div>
        )}
        {course.isEnrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/90 text-xs font-semibold text-white">
            <CheckCircle2 className="h-3 w-3" />
            Enrolled
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-md border font-medium ${CATEGORY_COLORS[course.category] ?? ""}`}>
            {course.category.replace("_", " ")}
          </span>
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-md border font-medium ${LEVEL_COLORS[course.level] ?? ""}`}>
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed flex-1 line-clamp-2">
          {truncate(course.description, 100)}
        </p>

        {/* Meta */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={course.author.image ?? ""} />
              <AvatarFallback className="text-[9px]">{getInitials(course.author.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-500 truncate max-w-[80px]">{course.author.name}</span>
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
            {course.averageRating && course.averageRating > 0 ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                {course.averageRating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
