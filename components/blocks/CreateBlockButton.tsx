"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { COLORS, DAY_NAMES } from "@/lib/utils";

export default function CreateBlockButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[4], days: [] as number[] });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    setOpen(false);
    setForm({ name: "", description: "", color: COLORS[4], days: [] });
    router.push(`/blocks/${data.id}`);
    router.refresh();
  }

  function toggleDay(d: number) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d],
    }));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nuevo bloque
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Nuevo bloque</h3>
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  placeholder="Ej: Mañana productiva, Tarde activa..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Descripción</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Días de la semana</label>
                <div className="flex gap-2">
                  {DAY_NAMES.map((n, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                        form.days.includes(i) ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
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
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm">Cancelar</button>
                <button type="submit" disabled={loading || !form.name.trim()} className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium">
                  {loading ? "Creando..." : "Crear y editar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
