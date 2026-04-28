// app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]) });

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { role } = schema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[ADMIN ROLE]", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
