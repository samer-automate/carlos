import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcStreak, calcCompletionRate } from "@/lib/habits";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { completions: { orderBy: { date: "asc" } } },
  });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...habit,
    streak: calcStreak(habit.completions.map((c) => c.date), habit.frequency, habit.targetDays),
    completionRate30: calcCompletionRate(habit.completions.map((c) => c.date), habit.frequency, habit.targetDays, 30),
    completionRate7: calcCompletionRate(habit.completions.map((c) => c.date), habit.frequency, habit.targetDays, 7),
    completionRate90: calcCompletionRate(habit.completions.map((c) => c.date), habit.frequency, habit.targetDays, 90),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const habit = await prisma.habit.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      frequency: body.frequency,
      targetDays: body.targetDays ? JSON.stringify(body.targetDays) : null,
      color: body.color,
      icon: body.icon,
      archived: body.archived,
    },
  });
  return NextResponse.json(habit);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.habit.update({ where: { id }, data: { archived: true } });
  return NextResponse.json({ ok: true });
}
