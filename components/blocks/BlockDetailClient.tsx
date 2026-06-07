"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { DAY_NAMES, COLORS } from "@/lib/utils";

type Habit = { id: string; name: string; color: string | null };
type Routine = { id: string; name: string; color: string | null };
type BlockHabit = { id: string; habitId: string; habit: Habit; order: number };
type BlockRoutine = { id: string; routineId: string; routine: Routine; order: number };
type Block = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  habits: BlockHabit[];
  routines: BlockRoutine[];
  schedules: Array<{ dayOfWeek: number }>;
};

export default function BlockDetailClient({
  block,
  allHabits,
  allRoutines,
}: {
  block: Block;
  allHabits: Habit[];
  allRoutines: Routine[];
}) {
  const router = useRouter();
  const [name, setName] = useState(block.name);
  const [description, setDescription] = useState(block.description ?? "");
  const [color, setColor] = useState(block.color ?? COLORS[4]);
  const [days, setDays] = useState(block.schedules.map((s) => s.dayOfWeek));
  const [habits, setHabits] = useState(block.habits);
  const [routines, setRoutines] = useState(block.routines);
  const [saving, setSaving] = useState(false);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function addHabit(habitId: string) {
    const h = allHabits.find((x) => x.id === habitId);
    if (!h || habits.some((bh) => bh.habitId === habitId)) return;
    setHabits((prev) => [...prev, { id: `new-${Date.now()}`, habitId: h.id, habit: h, order: prev.length }]);
  }

  function addRoutine(routineId: string) {
    const r = allRoutines.find((x) => x.id === routineId);
    if (!r || routines.some((br) => br.routineId === routineId)) return;
    setRoutines((prev) => [...prev, { id: `new-${Date.now()}`, routineId: r.id, routine: r, order: prev.length }]);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/blocks/${block.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        color,
        days,
        habits: habits.map((h, i) => ({ habitId: h.habitId, order: i })),
        routines: routines.map((r, i) => ({ routineId: r.routineId, order: i })),
      }),
    });
    setSaving(false);
    router.refresh();
  }

  async function deleteBlock() {
    if (!confirm("¿Eliminar este bloque?")) return;
    await fetch(`/api/blocks/${block.id}`, { method: "DELETE" });
    router.push("/blocks");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/blocks" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-white flex-1">Editar bloque</h2>
        <button onClick={deleteBlock} className="text-zinc-600 hover:text-red-400 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Descripción</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-zinc-400 mb-2 block">Días de la semana</label>
        <div className="flex gap-2">
          {DAY_NAMES.map((n, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                days.includes(i) ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-zinc-400 mb-2 block">Color</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Habits */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Hábitos</h3>
        {habits.length > 0 && (
          <div className="space-y-2 mb-3">
            {habits.map((bh, idx) => (
              <div key={bh.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: bh.habit.color ?? "#6366f1" }} />
                <span className="text-sm text-white flex-1">{bh.habit.name}</span>
                <button onClick={() => setHabits((prev) => prev.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <select
          onChange={(e) => { addHabit(e.target.value); e.target.value = ""; }}
          value=""
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Agregar hábito...</option>
          {allHabits.filter((h) => !habits.some((bh) => bh.habitId === h.id)).map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {/* Routines */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Rutinas</h3>
        {routines.length > 0 && (
          <div className="space-y-2 mb-3">
            {routines.map((br, idx) => (
              <div key={br.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: br.routine.color ?? "#10b981" }} />
                <span className="text-sm text-white flex-1">{br.routine.name}</span>
                <button onClick={() => setRoutines((prev) => prev.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <select
          onChange={(e) => { addRoutine(e.target.value); e.target.value = ""; }}
          value=""
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Agregar rutina...</option>
          {allRoutines.filter((r) => !routines.some((br) => br.routineId === r.id)).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <button
        onClick={save}
        disabled={saving || !name.trim()}
        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
