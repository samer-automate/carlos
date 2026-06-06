import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const block = await prisma.block.findUnique({
    where: { id },
    include: {
      habits: { include: { habit: true }, orderBy: { order: "asc" } },
      routines: { include: { routine: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });
  if (!block) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(block);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await prisma.$transaction([
    prisma.blockSchedule.deleteMany({ where: { blockId: id } }),
    prisma.blockHabit.deleteMany({ where: { blockId: id } }),
    prisma.blockRoutine.deleteMany({ where: { blockId: id } }),
  ]);

  const block = await prisma.block.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      schedules: {
        create: (body.days ?? []).map((d: number) => ({ dayOfWeek: d })),
      },
      habits: {
        create: (body.habits ?? []).map((h: { habitId: string; order: number }) => ({
          habitId: h.habitId,
          order: h.order,
        })),
      },
      routines: {
        create: (body.routines ?? []).map((r: { routineId: string; order: number }) => ({
          routineId: r.routineId,
          order: r.order,
        })),
      },
    },
    include: {
      habits: { include: { habit: true }, orderBy: { order: "asc" } },
      routines: { include: { routine: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });
  return NextResponse.json(block);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.block.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
