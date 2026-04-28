// app/(dashboard)/courses/new/page.tsx
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CourseForm } from "@/components/courses/course-form";

export const metadata = { title: "Create Course" };

export default async function NewCoursePage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create a New Course</h1>
        <p className="text-slate-400 mt-1">Fill in the details below to publish your course.</p>
      </div>
      <CourseForm />
    </div>
  );
}
