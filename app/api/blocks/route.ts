import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const blocks = await prisma.block.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      habits: { include: { habit: true }, orderBy: { order: "asc" } },
      routines: { include: { routine: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });
  return NextResponse.json(blocks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const block = await prisma.block.create({
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      schedules: {
        create: (body.days ?? []).map((d: number) => ({ dayOfWeek: d })),
      },
    },
    include: { habits: true, routines: true, schedules: true },
  });
  return NextResponse.json(block, { status: 201 });
}
