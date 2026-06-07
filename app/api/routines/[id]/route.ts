import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await prisma.routine.findUnique({
    where: { id },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });
  if (!routine) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(routine);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await prisma.routineSchedule.deleteMany({ where: { routineId: id } });
  if (body.exercises !== undefined) {
    await prisma.routineExercise.deleteMany({ where: { routineId: id } });
  }

  const routine = await prisma.routine.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      color: body.color,
      schedules: {
        create: (body.days ?? []).map((d: number) => ({ dayOfWeek: d })),
      },
      exercises: body.exercises
        ? {
            create: body.exercises.map((e: { exerciseId: string; order: number; targetSets?: number; targetReps?: number; targetWeight?: number; notes?: string }) => ({
              exerciseId: e.exerciseId,
              order: e.order,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              targetWeight: e.targetWeight,
              notes: e.notes,
            })),
          }
        : undefined,
    },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });
  return NextResponse.json(routine);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.routine.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
