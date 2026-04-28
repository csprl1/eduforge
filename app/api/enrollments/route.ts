// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Only allow fetching own enrollments unless admin
    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            author: { select: { id: true, name: true, image: true } },
            _count: { select: { lessons: true, enrollments: true, reviews: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: enrollments });
  } catch (error) {
    console.error("[ENROLLMENTS GET]", error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}
