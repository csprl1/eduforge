// app/(dashboard)/admin/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatDate, CATEGORY_COLORS } from "@/lib/utils";
import {
  Users, BookOpen, TrendingUp, Shield, ExternalLink, Trash2,
  CheckCircle2, XCircle, BarChart3,
} from "lucide-react";
import { AdminActions } from "@/components/admin/admin-actions";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [userCount, courseCount, enrollmentCount, users, recentCourses] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true, courses: true } },
      },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        author: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
    }),
  ]);

  const publishedCourses = await prisma.course.count({ where: { published: true } });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
          <Shield className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-slate-500">Platform management & analytics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Users", value: userCount, icon: Users, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Total Courses", value: courseCount, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Published", value: publishedCourses, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Enrollments", value: enrollmentCount, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Users table */}
        <div className="xl:col-span-3">
          <h2 className="text-lg font-bold text-white mb-4">All Users</h2>
          <div className="forge-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Activity</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={user.image ?? ""} />
                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white text-xs">{user.name}</p>
                            <p className="text-slate-500 text-xs truncate max-w-[140px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex text-xs px-2 py-0.5 rounded border font-medium ${
                            user.role === "ADMIN"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : user.role === "INSTRUCTOR"
                              ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                              : "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-slate-500 space-y-0.5">
                          <p>{user._count.enrollments} enrollments</p>
                          <p>{user._count.courses} courses</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AdminActions userId={user.id} currentRole={user.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="xl:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">Recent Courses</h2>
          <div className="space-y-2">
            {recentCourses.map((course) => (
              <div key={course.id} className="forge-card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 flex-1">
                    {course.title}
                  </p>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${
                      course.published
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {course.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>by {course.author.name}</span>
                  <span>{course._count.enrollments} students</span>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" asChild>
                    <Link href={`/courses/${course.id}`}>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" asChild>
                    <Link href={`/courses/${course.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
