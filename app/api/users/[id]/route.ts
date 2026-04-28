// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const canUpdate = session.user.id === id || session.user.role === "ADMIN";
    if (!canUpdate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, bio: true, image: true },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[USER PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: { select: { courses: true, enrollments: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[USER GET]", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
