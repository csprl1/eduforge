// app/(dashboard)/courses/[id]/lesson/[lessonId]/page.tsx
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonContent } from "@/components/courses/lesson-content";
import { AiQuizPanel } from "@/components/ai/ai-quiz-panel";
import { AiSummaryPanel } from "@/components/ai/ai-summary-panel";

type Params = { params: Promise<{ id: string; lessonId: string }> };

export async function generateMetadata({ params }: Params) {
  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { title: true } });
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Params) {
  const { id: courseId, lessonId } = await params;
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const [lesson, course, enrollment] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: { select: { id: true, title: true, authorId: true } } },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          where: { published: true },
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true },
        },
      },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    }),
  ]);

  if (!lesson || !course) notFound();

  const isOwner = course.authorId === session.user.id || session.user.role === "ADMIN";
  if (!enrollment && !isOwner) redirect(`/courses/${courseId}`);

  const lessonIndex = course.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:block truncate max-w-xs">{course.title}</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <span>{lessonIndex + 1}</span>
          <span>/</span>
          <span>{course.lessons.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Lesson sidebar */}
        <div className="xl:col-span-1 order-last xl:order-first">
          <div className="xl:sticky xl:top-24 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1 mb-3">
              Lessons
            </p>
            {course.lessons.map((l, idx) => (
              <Link
                key={l.id}
                href={`/courses/${courseId}/lesson/${l.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  l.id === lessonId
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <span
                  className={`h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-xs font-bold ${
                    l.id === lessonId ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate leading-tight">{l.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Lesson header */}
          <div className="animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{lesson.title}</h1>
            {lesson.duration && (
              <p className="text-sm text-slate-500">{lesson.duration} min read</p>
            )}
          </div>

          {/* Video embed */}
          {lesson.videoUrl && (
            <div className="animate-slide-up stagger-1 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10">
              <iframe
                src={lesson.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Lesson content */}
          <div className="animate-slide-up stagger-2">
            <LessonContent content={lesson.content} />
          </div>

          {/* AI Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up stagger-3">
            <AiSummaryPanel lessonId={lessonId} />
            <AiQuizPanel lessonId={lessonId} courseId={courseId} />
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 animate-slide-up stagger-4">
            {prevLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/courses/${courseId}/lesson/${prevLesson.id}`}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:block">{prevLesson.title}</span>
                  <span className="sm:hidden">Previous</span>
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Button asChild>
                <Link href={`/courses/${courseId}/lesson/${nextLesson.id}`}>
                  <span className="hidden sm:block">{nextLesson.title}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`/courses/${courseId}`}>
                  <ChevronUp className="h-4 w-4" />
                  Back to Course
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
