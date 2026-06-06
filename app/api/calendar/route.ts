import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCalendarEvents } from "@/lib/calendar";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = startOfDay(new Date(searchParams.get("start") ?? new Date()));
  const end = endOfDay(new Date(searchParams.get("end") ?? new Date()));

  const [habits, routines, blocks] = await Promise.all([
    prisma.habit.findMany({
      where: { archived: false },
      include: {
        completions: {
          where: { date: { gte: start, lte: end } },
        },
      },
    }),
    prisma.routine.findMany({ include: { schedules: true } }),
    prisma.block.findMany({ include: { schedules: true } }),
  ]);

  const events = buildCalendarEvents(start, end, habits, routines, blocks);
  return NextResponse.json(events);
}
