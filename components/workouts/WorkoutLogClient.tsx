"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Exercise = { id: string; name: string; category: string | null };
type RoutineExercise = { exercise: Exercise; targetSets: number | null; targetReps: number | null; targetWeight: number | null };
type Routine = { id: string; name: string; exercises: RoutineExercise[] };

type SetRow = { exerciseId: string; setNumber: number; reps: string; weight: string; notes: string };

export default function WorkoutLogClient({
  exercises,
  routine,
}: {
  exercises: Exercise[];
  routine: Routine | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(routine?.name ?? "");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [newExercise, setNewExercise] = useState("");
  const [newExName, setNewExName] = useState("");
  const [showNewEx, setShowNewEx] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialSets: SetRow[] = routine
    ? routine.exercises.flatMap((re) =>
        Array.from({ length: re.targetSets ?? 3 }, (_, i) => ({
          exerciseId: re.exercise.id,
          setNumber: i + 1,
          reps: String(re.targetReps ?? ""),
          weight: String(re.targetWeight ?? ""),
          notes: "",
        }))
      )
    : [];

  const [sets, setSets] = useState<SetRow[]>(initialSets);
  const [allExercises, setAllExercises] = useState<Exercise[]>(exercises);

  function addSet(exerciseId: string) {
    const count = sets.filter((s) => s.exerciseId === exerciseId).length;
    setSets((prev) => [...prev, { exerciseId, setNumber: count + 1, reps: "", weight: "", notes: "" }]);
  }

  function removeSet(idx: number) {
    setSets((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSet(idx: number, field: keyof SetRow, value: string) {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  function addExerciseToLog() {
    if (!newExercise) return;
    addSet(newExercise);
    setNewExercise("");
  }

  async function createExercise() {
    if (!newExName.trim()) return;
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newExName.trim() }),
    });
    const ex = await res.json();
    setAllExercises((prev) => [...prev, ex].sort((a, b) => a.name.localeCompare(b.name)));
    setNewExName("");
    setShowNewEx(false);
    setNewExercise(ex.id);
  }

  async function save() {
    if (sets.length === 0) return;
    setSaving(true);
    await fetch("/api/workouts/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || undefined,
        notes: notes.trim() || undefined,
        duration: duration ? parseInt(duration) : undefined,
        sets: sets.map((s) => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          reps: s.reps ? parseInt(s.reps) : undefined,
          weight: s.weight ? parseFloat(s.weight) : undefined,
          notes: s.notes || undefined,
        })),
      }),
    });
    setSaving(false);
    router.push("/workouts");
    router.refresh();
  }

  const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/workouts" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-white">Registrar entrenamiento</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="sm:col-span-2">
          <label className="text-xs text-zinc-400 mb-1 block">Nombre de la sesión</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            placeholder="Ej: Push day, Full body..."
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Duración (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            placeholder="60"
          />
        </div>
      </div>

      {/* Exercise sets */}
      {exerciseIds.map((exId) => {
        const ex = allExercises.find((e) => e.id === exId);
        const exSets = sets.filter((s) => s.exerciseId === exId);
        return (
          <div key={exId} className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <span className="font-medium text-white text-sm">{ex?.name}</span>
              <button
                onClick={() => addSet(exId)}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Serie
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 px-1 mb-1">
                <span className="col-span-1">#</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-3">Peso (kg)</span>
                <span className="col-span-4">Notas</span>
                <span className="col-span-1" />
              </div>
              {exSets.map((s, localIdx) => {
                const globalIdx = sets.findIndex((gs) => gs === s);
                return (
                  <div key={localIdx} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs text-zinc-500">{s.setNumber}</span>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => updateSet(globalIdx, "reps", e.target.value)}
                      className="col-span-3 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-emerald-500"
                      placeholder="—"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={s.weight}
                      onChange={(e) => updateSet(globalIdx, "weight", e.target.value)}
                      className="col-span-3 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-emerald-500"
                      placeholder="—"
                    />
                    <input
                      value={s.notes}
                      onChange={(e) => updateSet(globalIdx, "notes", e.target.value)}
                      className="col-span-4 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Opcional"
                    />
                    <button onClick={() => removeSet(globalIdx)} className="col-span-1 text-zinc-600 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add exercise */}
      <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-sm text-zinc-400 mb-3">Agregar ejercicio</p>
        {showNewEx ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createExercise()}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              placeholder="Nombre del ejercicio"
            />
            <button onClick={createExercise} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">Crear</button>
            <button onClick={() => setShowNewEx(false)} className="px-3 py-2 bg-zinc-800 text-zinc-400 text-sm rounded-lg">Cancelar</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Seleccionar ejercicio...</option>
              {allExercises.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <button onClick={addExerciseToLog} disabled={!newExercise} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm rounded-lg">
              Agregar
            </button>
            <button onClick={() => setShowNewEx(true)} className="px-3 py-2 bg-zinc-800 text-zinc-400 hover:text-white text-sm rounded-lg flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Notas de la sesión</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="Notas opcionales..."
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Link href="/workouts" className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm text-center hover:border-zinc-600">
          Cancelar
        </Link>
        <button
          onClick={save}
          disabled={saving || sets.length === 0}
          className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar sesión"}
        </button>
      </div>
    </div>
  );
}
