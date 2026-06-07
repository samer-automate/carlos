import { prisma } from "@/lib/db";
import { calcStreak } from "@/lib/habits";
import { format, startOfDay, getDay } from "date-fns";
import Link from "next/link";
import TodayHabitToggle from "@/components/habits/TodayHabitToggle";
import { DAY_NAMES_FULL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = startOfDay(new Date());
  const todayDow = getDay(today);
  const todayStr = format(today, "yyyy-MM-dd");

  const [habits, routines, blocks] = await Promise.all([
    prisma.habit.findMany({
      where: { archived: false },
      include: { completions: { orderBy: { date: "desc" } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.routine.findMany({
      where: { schedules: { some: { dayOfWeek: todayDow } } },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    }),
    prisma.block.findMany({
      where: { schedules: { some: { dayOfWeek: todayDow } } },
      include: {
        habits: { include: { habit: true }, orderBy: { order: "asc" } },
        routines: { include: { routine: true }, orderBy: { order: "asc" } },
      },
    }),
  ]);

  const todayHabits = habits.filter((h) => {
    const days = h.targetDays ? (JSON.parse(h.targetDays) as number[]) : null;
    return (
      h.frequency === "daily" ||
      (h.frequency !== "daily" && days?.includes(todayDow))
    );
  });

  const completedToday = new Set(
    habits.flatMap((h) =>
      h.completions
        .filter((c) => format(startOfDay(c.date), "yyyy-MM-dd") === todayStr)
        .map(() => h.id)
    )
  );

  const totalHabits = todayHabits.length;
  const doneHabits = todayHabits.filter((h) => completedToday.has(h.id)).length;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          {DAY_NAMES_FULL[todayDow]}, {format(today, "d 'de' MMMM")}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          {doneHabits}/{totalHabits} hábitos completados hoy
        </p>
      </div>

      <div className="w-full bg-zinc-800 rounded-full h-2 mb-8">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all"
          style={{ width: totalHabits ? `${(doneHabits / totalHabits) * 100}%` : "0%" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Hábitos de hoy</h3>
            <Link href="/habits" className="text-xs text-indigo-400 hover:text-indigo-300">Ver todos →</Link>
          </div>
          {todayHabits.length === 0 ? (
            <p className="text-zinc-500 text-sm">No hay hábitos para hoy.{" "}
              <Link href="/habits" className="text-indigo-400">Crear uno</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {todayHabits.map((habit) => {
                const streak = calcStreak(habit.completions.map((c) => c.date), habit.frequency, habit.targetDays);
                return (
                  <TodayHabitToggle
                    key={habit.id}
                    habit={{ id: habit.id, name: habit.name, color: habit.color, streak }}
                    completed={completedToday.has(habit.id)}
                    date={todayStr}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Rutinas de hoy</h3>
            <Link href="/routines" className="text-xs text-indigo-400 hover:text-indigo-300">Ver todas →</Link>
          </div>
          {routines.length === 0 && blocks.length === 0 ? (
            <p className="text-zinc-500 text-sm">No hay rutinas para hoy.{" "}
              <Link href="/routines" className="text-indigo-400">Crear una</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {routines.map((r) => (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: r.color ?? "#10b981" }} />
                    <span className="font-medium text-white text-sm">{r.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{r.exercises.length} ejercicios</p>
                  <Link href={`/workouts/log?routineId=${r.id}`} className="mt-2 inline-block text-xs text-emerald-400 hover:text-emerald-300">
                    Registrar sesión →
                  </Link>
                </div>
              ))}
              {blocks.map((b) => (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: b.color ?? "#f59e0b" }} />
                    <span className="font-medium text-white text-sm">{b.name}</span>
                    <span className="text-xs text-zinc-500 ml-1">Bloque</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {b.habits.length} hábitos · {b.routines.length} rutinas
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {habits.length > 0 && (
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {habits.slice(0, 4).map((h) => {
            const streak = calcStreak(h.completions.map((c) => c.date), h.frequency, h.targetDays);
            return (
              <Link
                key={h.id}
                href={`/habits/${h.id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: h.color ?? "#6366f1" }} />
                  <span className="text-xs text-zinc-400 truncate">{h.name}</span>
                </div>
                <p className="text-2xl font-bold text-white">{streak}</p>
                <p className="text-xs text-zinc-500">días seguidos</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
