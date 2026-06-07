import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const routines = await prisma.routine.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });
  return NextResponse.json(routines);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const routine = await prisma.routine.create({
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      schedules: {
        create: (body.days ?? []).map((d: number) => ({ dayOfWeek: d })),
      },
    },
    include: { exercises: true, schedules: true },
  });
  return NextResponse.json(routine, { status: 201 });
}
