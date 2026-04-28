// app/(dashboard)/courses/[id]/edit/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { CourseForm } from "@/components/courses/course-form";
import { LessonManager } from "@/components/courses/lesson-manager";
import { Tabs } from "@/components/ui/tabs-simple";

export const metadata = { title: "Edit Course" };

type Params = { params: Promise<{ id: string }> };

export default async function EditCoursePage({ params }: Params) {
  const { id } = await params;
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  const canEdit = course.authorId === session.user.id || session.user.role === "ADMIN";
  if (!canEdit) redirect("/dashboard");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white truncate">{course.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
          <span>{course._count.enrollments} students enrolled</span>
          <span>{course.lessons.length} lessons</span>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
              course.published
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            {course.published ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <div className="space-y-10">
        {/* Course settings */}
        <section>
          <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white/5">
            Course Settings
          </h2>
          <CourseForm
            courseId={id}
            defaultValues={{
              title: course.title,
              description: course.description,
              category: course.category,
              level: course.level,
              tags: course.tags,
              price: course.price,
              published: course.published,
              thumbnail: course.thumbnail ?? "",
            }}
          />
        </section>

        {/* Lesson manager */}
        <section>
          <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white/5">
            Lessons
          </h2>
          <LessonManager courseId={id} lessons={course.lessons} />
        </section>
      </div>
    </div>
  );
}
