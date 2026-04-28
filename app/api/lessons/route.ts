// app/api/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { lessonSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { courseId, ...lessonData } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const data = lessonSchema.parse(lessonData);

    // Verify course ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const canEdit =
      session.user.role === "ADMIN" || course.authorId === session.user.id;
    if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const lesson = await prisma.lesson.create({
      data: { ...data, courseId },
    });

    return NextResponse.json({ data: lesson }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 });
    }
    console.error("[LESSON POST]", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
