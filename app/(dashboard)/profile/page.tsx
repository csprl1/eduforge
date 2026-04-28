// app/(dashboard)/profile/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form";
import { getInitials, formatDate, CATEGORY_COLORS } from "@/lib/utils";
import { BookOpen, Trophy, Users, Star, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const [user, enrollments, instructorCourses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, bio: true, role: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { id: true, title: true, category: true, _count: { select: { lessons: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    session.user.role !== "STUDENT"
      ? prisma.course.findMany({
          where: { authorId: session.user.id },
          include: { _count: { select: { enrollments: true, lessons: true } } },
          orderBy: { createdAt: "desc" },
        })
      : null,
  ]);

  if (!user) redirect("/login");

  const completedCourses = enrollments.filter((e) => e.progress >= 100);
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
      : 0;
  const totalStudents = instructorCourses?.reduce((s, c) => s + c._count.enrollments, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="forge-card p-6 text-center animate-slide-up">
            <div className="relative inline-block mb-4">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <div className="mt-3 flex justify-center">
              <span
                className={`inline-flex text-xs px-3 py-1 rounded-full border font-semibold ${
                  user.role === "ADMIN"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : user.role === "INSTRUCTOR"
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                    : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                }`}
              >
                {user.role}
              </span>
            </div>
            {user.bio && (
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">{user.bio}</p>
            )}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-600">
              <Calendar className="h-3 w-3" />
              Joined {formatDate(user.createdAt)}
            </div>
          </div>

          {/* Stats */}
          <div className="forge-card p-5 space-y-4 animate-slide-up stagger-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stats</h3>
            {[
              { label: "Courses Enrolled", value: enrollments.length, icon: BookOpen, color: "text-indigo-400" },
              { label: "Completed", value: completedCourses.length, icon: Trophy, color: "text-amber-400" },
              { label: "Avg Progress", value: `${avgProgress}%`, icon: Star, color: "text-emerald-400" },
              ...(instructorCourses
                ? [{ label: "Total Students", value: totalStudents, icon: Users, color: "text-purple-400" }]
                : []),
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  {stat.label}
                </div>
                <span className="text-sm font-bold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit profile */}
          <div className="animate-slide-up stagger-1">
            <h2 className="text-lg font-bold text-white mb-5">Edit Profile</h2>
            <ProfileEditForm
              userId={user.id}
              defaultValues={{ name: user.name ?? "", bio: user.bio ?? "" }}
            />
          </div>

          {/* My enrollments */}
          <div className="animate-slide-up stagger-2">
            <h2 className="text-lg font-bold text-white mb-4">My Courses</h2>
            {enrollments.length === 0 ? (
              <div className="forge-card p-8 text-center">
                <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No courses yet.</p>
                <Link href="/courses" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
                  Browse courses →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.course.id}`}
                    className="forge-card p-4 flex items-center gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                        {enrollment.course.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={enrollment.progress} className="h-1.5 flex-1 max-w-[120px]" />
                        <span className="text-xs text-slate-500 font-mono">
                          {Math.round(enrollment.progress)}%
                        </span>
                        {enrollment.progress >= 100 && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <Trophy className="h-3 w-3" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded border font-medium ${
                        CATEGORY_COLORS[enrollment.course.category] ?? ""
                      }`}
                    >
                      {enrollment.course.category.replace(/_/g, " ")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Instructor courses */}
          {instructorCourses && instructorCourses.length > 0 && (
            <div className="animate-slide-up stagger-3">
              <h2 className="text-lg font-bold text-white mb-4">Courses You Teach</h2>
              <div className="space-y-3">
                {instructorCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}/edit`}
                    className="forge-card p-4 flex items-center gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate transition-colors">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{course._count.enrollments} students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />{course._count.lessons} lessons
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border font-medium ${
                        course.published
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {course.published ? "Live" : "Draft"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
