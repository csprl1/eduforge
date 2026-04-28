// app/(dashboard)/dashboard/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Plus, TrendingUp, Users, Trophy, Clock,
  ArrowRight, Sparkles, BarChart3, Star,
} from "lucide-react";
import { CATEGORY_COLORS, LEVEL_COLORS, truncate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const isInstructor = session.user.role === "INSTRUCTOR" || session.user.role === "ADMIN";

  const [enrollments, instructorData] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            author: { select: { name: true } },
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    isInstructor
      ? prisma.course.findMany({
          where: { authorId: session.user.id },
          include: { _count: { select: { enrollments: true, lessons: true, reviews: true } } },
          orderBy: { createdAt: "desc" },
          take: 4,
        })
      : null,
  ]);

  const totalEnrollments = await prisma.enrollment.count({ where: { userId: session.user.id } });
  const completedCourses = enrollments.filter((e) => e.progress >= 100).length;
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
    : 0;

  const instructorStats = isInstructor && instructorData
    ? {
        totalCourses: instructorData.length,
        totalStudents: instructorData.reduce((s, c) => s + c._count.enrollments, 0),
        published: instructorData.filter((c) => c.published).length,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 animate-slide-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1">
              {isInstructor ? "Manage your courses and track student progress." : "Continue where you left off."}
            </p>
          </div>
          {isInstructor && (
            <Button asChild>
              <Link href="/courses/new">
                <Plus className="h-4 w-4" /> New Course
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-slide-up stagger-1">
        {[
          {
            label: "Enrolled",
            value: totalEnrollments,
            icon: BookOpen,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Completed",
            value: completedCourses,
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Avg Progress",
            value: `${avgProgress}%`,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          ...(instructorStats
            ? [{ label: "Your Students", value: instructorStats.totalStudents, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" }]
            : [{ label: "Hours Spent", value: "—", icon: Clock, color: "text-rose-400", bg: "bg-rose-500/10" }]),
        ].map((stat) => (
          <div key={stat.label} className="forge-card p-5">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses / Enrollments */}
        <div className="lg:col-span-2 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">My Learning</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses" className="gap-1.5">
                Browse more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {enrollments.length === 0 ? (
            <div className="forge-card p-10 text-center">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No courses yet</p>
              <p className="text-sm text-slate-600 mt-1 mb-4">Explore our catalog and start learning</p>
              <Button size="sm" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.courseId}`}
                  className="forge-card p-4 flex items-center gap-4 block group"
                >
                  <div className="h-12 w-12 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {truncate(enrollment.course.title, 50)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {enrollment.course._count.lessons} lessons
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={enrollment.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-slate-400 font-mono shrink-0">
                        {Math.round(enrollment.progress)}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 animate-slide-up stagger-3">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/courses" className="forge-card p-3.5 flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Explore Courses
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 ml-auto" />
              </Link>
              {isInstructor && (
                <>
                  <Link href="/courses/new" className="forge-card p-3.5 flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      Create Course
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 ml-auto" />
                  </Link>
                  <Link href="/profile" className="forge-card p-3.5 flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      View Analytics
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 ml-auto" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Instructor Courses */}
          {isInstructor && instructorData && instructorData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Courses</h2>
                <span className="text-xs text-slate-500">{instructorStats?.totalCourses} total</span>
              </div>
              <div className="space-y-2">
                {instructorData.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}/edit`}
                    className="forge-card p-3.5 flex items-center gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-300 group-hover:text-white truncate transition-colors">
                        {truncate(course.title, 35)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-600">
                          {course._count.enrollments} students
                        </span>
                        <span className={`inline-flex text-xs px-1.5 py-0.5 rounded border ${course.published ? "border-emerald-500/20 text-emerald-400" : "border-amber-500/20 text-amber-400"}`}>
                          {course.published ? "Live" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI Feature Promo */}
          <div className="forge-card p-5 bg-gradient-to-br from-indigo-600/10 to-purple-600/5 border-indigo-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-bold text-indigo-300">AI Features</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Open any lesson to use AI quiz generation and instant lesson summarization powered by Groq.
            </p>
            <Button size="sm" variant="outline" asChild className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
              <Link href="/courses">Try it now →</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
