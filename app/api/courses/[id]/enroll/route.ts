// app/api/courses/[id]/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.course.findUnique({
      where: { id, published: true },
    });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // Check already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: session.user.id, courseId: id, progress: 0 },
    });

    return NextResponse.json({ data: enrollment, message: "Enrolled successfully!" }, { status: 201 });
  } catch (error) {
    console.error("[ENROLL]", error);
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.enrollment.delete({
      where: { userId_courseId: { userId: session.user.id, courseId: id } },
    });

    return NextResponse.json({ message: "Unenrolled successfully" });
  } catch (error) {
    console.error("[UNENROLL]", error);
    return NextResponse.json({ error: "Failed to unenroll" }, { status: 500 });
  }
}
