// app/(dashboard)/courses/page.tsx
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { CourseFilters } from "@/components/courses/course-filters";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata = { title: "Explore Courses" };

interface PageProps {
  searchParams: Promise<{
    category?: string;
    level?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getAuthSession();
  const isInstructor = session?.user.role === "INSTRUCTOR" || session?.user.role === "ADMIN";

  const page = parseInt(params.page ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { published: true };
  if (params.category) where.category = params.category;
  if (params.level) where.level = params.level;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [courses, total, enrolledIds] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { lessons: true, enrollments: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.course.count({ where }),
    session
      ? prisma.enrollment.findMany({
          where: { userId: session.user.id },
          select: { courseId: true },
        }).then((e) => e.map((en) => en.courseId))
      : [],
  ]);

  const totalPages = Math.ceil(total / limit);

  const coursesWithRating = courses.map((c) => ({
    ...c,
    averageRating: c.reviews.length
      ? c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length
      : 0,
    isEnrolled: enrolledIds.includes(c.id),
  }));

  const content = (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Courses</h1>
          <p className="text-slate-400 mt-1">
            {total} course{total !== 1 ? "s" : ""} available
          </p>
        </div>
        {isInstructor && (
          <Button asChild>
            <Link href="/courses/new">
              <Plus className="h-4 w-4" /> Create Course
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <CourseFilters
            categories={COURSE_CATEGORIES}
            levels={COURSE_LEVELS}
            activeCategory={params.category}
            activeLevel={params.level}
            search={params.search}
          />
        </div>

        {/* Course grid */}
        <div className="lg:col-span-3">
          {coursesWithRating.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-400">No courses found</h3>
              <p className="text-slate-600 mt-1 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {coursesWithRating.map((course, i) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={course.isEnrolled}
                    animationDelay={i * 0.05}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/courses?page=${p}${params.category ? `&category=${params.category}` : ""}${params.level ? `&level=${params.level}` : ""}`}
                      className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "border border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );

  // If user is logged in, use dashboard layout (already wraps with Navbar/Footer via parent layout)
  // If not logged in, wrap manually
  if (session) return content;

  return (
    <>
      <Navbar />
      {content}
      <Footer />
    </>
  );
}
