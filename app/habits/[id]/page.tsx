import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { calcStreak, calcCompletionRate } from "@/lib/habits";
import { format, startOfDay } from "date-fns";
import HabitDetailClient from "@/components/habits/HabitDetailClient";

export const dynamic = "force-dynamic";

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { completions: { orderBy: { date: "asc" } } },
  });
  if (!habit) notFound();

  const completionDates = habit.completions.map((c) => c.date);
  const streak = calcStreak(completionDates, habit.frequency, habit.targetDays);
  const rate7 = calcCompletionRate(completionDates, habit.frequency, habit.targetDays, 7);
  const rate30 = calcCompletionRate(completionDates, habit.frequency, habit.targetDays, 30);
  const rate90 = calcCompletionRate(completionDates, habit.frequency, habit.targetDays, 90);

  const completedDates = habit.completions.map((c) => format(startOfDay(c.date), "yyyy-MM-dd"));

  return (
    <HabitDetailClient
      habit={{ ...habit, targetDays: habit.targetDays ?? undefined }}
      streak={streak}
      rates={{ r7: rate7, r30: rate30, r90: rate90 }}
      completedDates={completedDates}
    />
  );
}
