"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { DAY_NAMES, COLORS } from "@/lib/utils";

type Exercise = { id: string; name: string; category: string | null };
type RoutineExercise = {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  notes: string | null;
};
type Routine = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  exercises: RoutineExercise[];
  schedules: Array<{ dayOfWeek: number }>;
};

export default function RoutineDetailClient({
  routine,
  allExercises,
}: {
  routine: Routine;
  allExercises: Exercise[];
}) {
  const router = useRouter();
  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description ?? "");
  const [color, setColor] = useState(routine.color ?? COLORS[1]);
  const [days, setDays] = useState(routine.schedules.map((s) => s.dayOfWeek));
  const [exercises, setExercises] = useState(routine.exercises);
  const [newExId, setNewExId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function addExercise() {
    if (!newExId) return;
    const ex = allExercises.find((e) => e.id === newExId);
    if (!ex) return;
    setExercises((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        exerciseId: ex.id,
        exercise: ex,
        order: prev.length,
        targetSets: 3,
        targetReps: 10,
        targetWeight: null,
        notes: null,
      },
    ]);
    setNewExId("");
  }

  function removeExercise(idx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, order: i })));
  }

  function updateExercise(idx: number, field: string, value: string | number | null) {
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/routines/${routine.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        color,
        days,
        exercises: exercises.map((e, i) => ({
          exerciseId: e.exerciseId,
          order: i,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          targetWeight: e.targetWeight,
          notes: e.notes,
        })),
      }),
    });
    setSaving(false);
    router.refresh();
  }

  async function deleteRoutine() {
    if (!confirm("¿Eliminar esta rutina?")) return;
    setDeleting(true);
    await fetch(`/api/routines/${routine.id}`, { method: "DELETE" });
    router.push("/routines");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/routines" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-white flex-1">Editar rutina</h2>
        <button onClick={deleteRoutine} disabled={deleting} className="text-zinc-600 hover:text-red-400 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Descripción</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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
                days.includes(i) ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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

      {/* Exercises */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Ejercicios</h3>
        {exercises.length === 0 ? (
          <p className="text-zinc-500 text-sm mb-4">No hay ejercicios. Agrega uno abajo.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <GripVertical className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="text-sm text-white flex-1 min-w-0 truncate">{ex.exercise.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    value={ex.targetSets ?? ""}
                    onChange={(e) => updateExercise(idx, "targetSets", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    placeholder="Series"
                  />
                  <span className="text-zinc-600 text-xs">×</span>
                  <input
                    type="number"
                    value={ex.targetReps ?? ""}
                    onChange={(e) => updateExercise(idx, "targetReps", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    placeholder="Reps"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={ex.targetWeight ?? ""}
                    onChange={(e) => updateExercise(idx, "targetWeight", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    placeholder="kg"
                  />
                  <button onClick={() => removeExercise(idx)} className="text-zinc-600 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <select
            value={newExId}
            onChange={(e) => setNewExId(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Agregar ejercicio...</option>
            {allExercises.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <button
            onClick={addExercise}
            disabled={!newExId}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving || !name.trim()}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
