import { prisma } from "@/lib/db";
import Link from "next/link";
import CreateBlockButton from "@/components/blocks/CreateBlockButton";
import { DAY_NAMES } from "@/lib/utils";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlocksPage() {
  const blocks = await prisma.block.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      habits: { include: { habit: true } },
      routines: { include: { routine: true } },
      schedules: true,
    },
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Bloques de actividad</h2>
          <p className="text-zinc-400 text-sm mt-1">Agrupa hábitos y rutinas en bloques programados</p>
        </div>
        <CreateBlockButton />
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">No tienes bloques aún</p>
          <p className="text-sm">Crea un bloque para combinar hábitos y rutinas en un solo evento</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {blocks.map((b) => (
            <Link
              key={b.id}
              href={`/blocks/${b.id}`}
              className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="w-1 min-h-[40px] h-full rounded-full shrink-0" style={{ background: b.color ?? "#f59e0b" }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{b.name}</p>
                {b.description && <p className="text-xs text-zinc-500 mt-0.5">{b.description}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {b.schedules
                    .sort((a, c) => a.dayOfWeek - c.dayOfWeek)
                    .map((s) => (
                      <span key={s.id} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                        {DAY_NAMES[s.dayOfWeek]}
                      </span>
                    ))}
                </div>
                <div className="flex gap-3 mt-2">
                  {b.habits.length > 0 && (
                    <span className="text-xs text-indigo-400">{b.habits.length} hábitos</span>
                  )}
                  {b.routines.length > 0 && (
                    <span className="text-xs text-emerald-400">{b.routines.length} rutinas</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
