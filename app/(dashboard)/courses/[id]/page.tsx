// app/(dashboard)/courses/[id]/page.tsx
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EnrollButton } from "@/components/courses/enroll-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Users, Star, Clock, ChevronRight,
  CheckCircle2, Lock, Edit, BarChart3, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS, LEVEL_COLORS, getInitials, formatDate, formatDuration } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id }, select: { title: true } });
  return { title: course?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: Params) {
  const { id } = await params;
  const session = await getAuthSession();

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
      lessons: { orderBy: { order: "asc" }, where: { published: true } },
      _count: { select: { enrollments: true, reviews: true } },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!course) notFound();
  if (!course.published && course.authorId !== session?.user.id && session?.user.role !== "ADMIN") {
    notFound();
  }

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: id } },
      })
    : null;

  const avgRating = course.reviews.length
    ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
    : 0;

  const totalDuration = course.lessons.reduce((s, l) => s + (l.duration ?? 0), 0);
  const isOwner = session?.user.id === course.authorId || session?.user.role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/courses" className="hover:text-slate-300 transition-colors">Courses</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-400 truncate">{course.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex text-xs px-2.5 py-1 rounded-md border font-medium ${CATEGORY_COLORS[course.category]}`}>
                {course.category.replace(/_/g, " ")}
              </span>
              <span className={`inline-flex text-xs px-2.5 py-1 rounded-md border font-medium ${LEVEL_COLORS[course.level]}`}>
                {course.level}
              </span>
              {!course.published && (
                <span className="inline-flex text-xs px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium">
                  Draft
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-400 leading-relaxed">{course.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {course._count.enrollments} enrolled
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {course.lessons.length} lessons
              </div>
              {totalDuration > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(totalDuration)}
                </div>
              )}
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  {avgRating.toFixed(1)} ({course._count.reviews} reviews)
                </div>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={course.author.image ?? ""} />
                <AvatarFallback>{getInitials(course.author.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{course.author.name}</p>
                <p className="text-xs text-slate-500">Instructor</p>
              </div>
            </div>
          </div>

          {/* Lessons list */}
          <div className="animate-slide-up stagger-2">
            <h2 className="text-xl font-bold text-white mb-5">Course Content</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => (
                <div key={lesson.id}>
                  {enrollment || isOwner ? (
                    <Link
                      href={`/courses/${id}/lesson/${lesson.id}`}
                      className="forge-card p-4 flex items-center gap-4 group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                          {lesson.title}
                        </p>
                        {lesson.duration && (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />{lesson.duration}m
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </Link>
                  ) : (
                    <div className="forge-card p-4 flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500">{lesson.title}</p>
                      </div>
                      <Lock className="h-4 w-4 text-slate-600 shrink-0" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {course.reviews.length > 0 && (
            <div className="mt-10 animate-slide-up stagger-3">
              <h2 className="text-xl font-bold text-white mb-5">Student Reviews</h2>
              <div className="space-y-4">
                {course.reviews.map((review) => (
                  <div key={review.id} className="forge-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.user.image ?? ""} />
                        <AvatarFallback className="text-xs">{getInitials(review.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{review.user.name}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? "text-amber-400 fill-current" : "text-slate-700"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-400">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Enroll card */}
            <div className="forge-card p-6 animate-slide-up">
              <div className="text-center mb-5">
                <p className="text-3xl font-bold text-white mb-1">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </p>
                <p className="text-sm text-slate-500">{course.price === 0 ? "No cost to enroll" : "One-time payment"}</p>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/courses/${id}/edit`}>
                      <Edit className="h-4 w-4" /> Edit Course
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href={`/courses/${id}/edit`}>
                      <BarChart3 className="h-4 w-4" /> View Analytics
                    </Link>
                  </Button>
                </div>
              ) : session ? (
                <EnrollButton
                  courseId={id}
                  isEnrolled={!!enrollment}
                  progress={enrollment?.progress ?? 0}
                />
              ) : (
                <Button asChild className="w-full" size="lg" variant="glow">
                  <Link href="/login">Sign in to Enroll</Link>
                </Button>
              )}

              <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {course.lessons.length} structured lessons
                </li>
                {totalDuration > 0 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    {formatDuration(totalDuration)} of content
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  AI-powered quizzes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Lesson summaries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Progress tracking
                </li>
              </ul>
            </div>

            {/* AI Feature badge */}
            <div className="forge-card p-4 border-indigo-500/20 bg-indigo-600/5">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-indigo-300 font-semibold">AI-Enhanced</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Each lesson includes AI quiz generation and instant summarization powered by Groq.
              </p>
            </div>

            {/* Tags */}
            {course.tags.length > 0 && (
              <div className="forge-card p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
