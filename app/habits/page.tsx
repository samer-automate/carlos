import { prisma } from "@/lib/db";
import { calcStreak, calcCompletionRate } from "@/lib/habits";
import Link from "next/link";
import CreateHabitButton from "@/components/habits/CreateHabitButton";
import { Flame, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await prisma.habit.findMany({
    where: { archived: false },
    include: { completions: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Hábitos</h2>
          <p className="text-zinc-400 text-sm mt-1">{habits.length} hábitos activos</p>
        </div>
        <CreateHabitButton />
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">No tienes hábitos aún</p>
          <p className="text-sm">Crea tu primer hábito para empezar a trackear tu progreso</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => {
            const completionDates = habit.completions.map((c) => c.date);
            const streak = calcStreak(completionDates, habit.frequency, habit.targetDays);
            const rate30 = calcCompletionRate(completionDates, habit.frequency, habit.targetDays, 30);

            return (
              <Link
                key={habit.id}
                href={`/habits/${habit.id}`}
                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
              >
                <div
                  className="w-4 h-10 rounded-full shrink-0"
                  style={{ background: habit.color ?? "#6366f1" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{habit.name}</p>
                  {habit.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{habit.description}</p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1 capitalize">
                    {habit.frequency === "daily" ? "Diario" : habit.frequency === "weekly" ? "Semanal" : "Personalizado"}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-4 h-4" />
                      <span className="text-lg font-bold">{streak}</span>
                    </div>
                    <p className="text-xs text-zinc-500">racha</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-lg font-bold">{rate30}%</span>
                    </div>
                    <p className="text-xs text-zinc-500">30 días</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
