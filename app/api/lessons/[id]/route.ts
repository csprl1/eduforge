// app/api/lessons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { lessonSchema } from "@/lib/validations";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: { select: { id: true, title: true, authorId: true } } },
    });

    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error("[LESSON GET]", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    const canEdit =
      session.user.role === "ADMIN" || lesson.course.authorId === session.user.id;
    if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = lessonSchema.partial().parse(body);

    const updated = await prisma.lesson.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 });
    }
    console.error("[LESSON PATCH]", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    const canDelete =
      session.user.role === "ADMIN" || lesson.course.authorId === session.user.id;
    if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.lesson.delete({ where: { id } });
    return NextResponse.json({ message: "Lesson deleted" });
  } catch (error) {
    console.error("[LESSON DELETE]", error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
