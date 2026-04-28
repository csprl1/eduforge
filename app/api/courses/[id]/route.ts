// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { courseSchema } from "@/lib/validations";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true, bio: true } },
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true, reviews: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating = course.reviews.length
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : 0;

    return NextResponse.json({ data: { ...course, averageRating: avgRating } });
  } catch (error) {
    console.error("[COURSE GET]", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const canEdit =
      session.user.role === "ADMIN" || course.authorId === session.user.id;
    if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = courseSchema.partial().parse(body);

    const updated = await prisma.course.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { lessons: true, enrollments: true, reviews: true } },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 });
    }
    console.error("[COURSE PATCH]", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const canDelete =
      session.user.role === "ADMIN" || course.authorId === session.user.id;
    if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("[COURSE DELETE]", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
