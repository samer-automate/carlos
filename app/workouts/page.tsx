import { prisma } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Dumbbell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { date: "desc" },
    include: {
      sets: { include: { exercise: true }, orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }] },
    },
    take: 50,
  });

  const grouped = sessions.reduce((acc, s) => {
    const exercises = [...new Set(s.sets.map((set) => set.exercise.name))];
    return [...acc, { ...s, exerciseNames: exercises }];
  }, [] as Array<(typeof sessions)[0] & { exerciseNames: string[] }>);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Entrenamientos</h2>
          <p className="text-zinc-400 text-sm mt-1">{sessions.length} sesiones registradas</p>
        </div>
        <Link
          href="/workouts/log"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva sesión
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">No hay sesiones registradas</p>
          <Link href="/workouts/log" className="text-emerald-400 hover:text-emerald-300 text-sm">
            Registra tu primer entrenamiento →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((session) => (
            <div key={session.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">{session.name || "Sesión de entrenamiento"}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {format(new Date(session.date), "EEEE, d MMMM yyyy")}
                    {session.duration ? ` · ${session.duration} min` : ""}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                  {session.sets.length} series
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.exerciseNames.map((name) => (
                  <span key={name} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
              {session.notes && (
                <p className="text-xs text-zinc-500 mt-3 italic">{session.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
