import { prisma } from "@/lib/db";
import Link from "next/link";
import CreateRoutineButton from "@/components/routines/CreateRoutineButton";
import { DAY_NAMES } from "@/lib/utils";
import { ListChecks } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const routines = await prisma.routine.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
      schedules: true,
    },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Rutinas</h2>
          <p className="text-zinc-400 text-sm mt-1">{routines.length} rutinas creadas</p>
        </div>
        <CreateRoutineButton />
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">No tienes rutinas aún</p>
          <p className="text-sm">Crea una rutina y asígnala a días de la semana</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {routines.map((r) => (
            <Link
              key={r.id}
              href={`/routines/${r.id}`}
              className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="w-1 h-full min-h-[40px] rounded-full shrink-0" style={{ background: r.color ?? "#10b981" }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{r.name}</p>
                {r.description && <p className="text-xs text-zinc-500 mt-0.5">{r.description}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.schedules
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((s) => (
                      <span key={s.id} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                        {DAY_NAMES[s.dayOfWeek]}
                      </span>
                    ))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-white">{r.exercises.length}</p>
                <p className="text-xs text-zinc-500">ejercicios</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
