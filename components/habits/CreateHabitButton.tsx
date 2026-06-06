"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { COLORS, DAY_NAMES } from "@/lib/utils";

export default function CreateHabitButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    frequency: "daily",
    targetDays: [] as number[],
    color: COLORS[0],
  });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetDays: form.frequency !== "daily" ? form.targetDays : undefined,
      }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ name: "", description: "", frequency: "daily", targetDays: [], color: COLORS[0] });
    router.refresh();
  }

  function toggleDay(d: number) {
    setForm((f) => ({
      ...f,
      targetDays: f.targetDays.includes(d) ? f.targetDays.filter((x) => x !== d) : [...f.targetDays, d],
    }));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nuevo hábito
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Nuevo hábito</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Nombre *</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Ej: Meditación, Lectura..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Descripción</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Frecuencia</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Días específicos</option>
                </select>
              </div>
              {form.frequency === "weekly" && (
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Días</label>
                  <div className="flex gap-2">
                    {DAY_NAMES.map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                          form.targetDays.includes(i)
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.name.trim()}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {loading ? "Creando..." : "Crear hábito"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
