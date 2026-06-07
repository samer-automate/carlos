import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calcStreak, calcCompletionRate } from "@/lib/habits";

export async function GET() {
  const habits = await prisma.habit.findMany({
    where: { archived: false },
    include: { completions: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "asc" },
  });

  const data = habits.map((h) => ({
    ...h,
    streak: calcStreak(h.completions.map((c) => c.date), h.frequency, h.targetDays),
    completionRate: calcCompletionRate(h.completions.map((c) => c.date), h.frequency, h.targetDays, 30),
  }));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const habit = await prisma.habit.create({
    data: {
      name: body.name,
      description: body.description,
      frequency: body.frequency ?? "daily",
      targetDays: body.targetDays ? JSON.stringify(body.targetDays) : null,
      color: body.color,
      icon: body.icon,
    },
  });
  return NextResponse.json(habit, { status: 201 });
}
