// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { courseSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const published = searchParams.get("published");
    const authorId = searchParams.get("authorId");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (published !== "all") {
      where.published = published === "false" ? false : true;
    }
    if (category) where.category = category;
    if (level) where.level = level;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { lessons: true, enrollments: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      data: courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[COURSES GET]", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "STUDENT") {
      return NextResponse.json({ error: "Only instructors can create courses" }, { status: 403 });
    }

    const body = await req.json();
    const data = courseSchema.parse(body);

    let slug = slugify(data.title);
    // Ensure slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const course = await prisma.course.create({
      data: {
        ...data,
        slug,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { lessons: true, enrollments: true, reviews: true } },
      },
    });

    return NextResponse.json({ data: course }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 });
    }
    console.error("[COURSES POST]", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
