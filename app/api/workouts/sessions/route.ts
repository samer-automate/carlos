import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { date: "desc" },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await prisma.workoutSession.create({
    data: {
      name: body.name,
      notes: body.notes,
      duration: body.duration,
      date: body.date ? new Date(body.date) : new Date(),
      sets: {
        create: (body.sets ?? []).map((s: { exerciseId: string; setNumber: number; reps?: number; weight?: number; duration?: number; notes?: string }) => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          duration: s.duration,
          notes: s.notes,
        })),
      },
    },
    include: { sets: { include: { exercise: true } } },
  });
  return NextResponse.json(session, { status: 201 });
}
