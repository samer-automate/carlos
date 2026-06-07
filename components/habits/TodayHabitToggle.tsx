"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Flame } from "lucide-react";

type Props = {
  habit: { id: string; name: string; color: string | null; streak: number };
  completed: boolean;
  date: string;
};

export default function TodayHabitToggle({ habit, completed: initial, date }: Props) {
  const [done, setDone] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    if (done) {
      await fetch(`/api/habits/${habit.id}/completions?date=${date}`, { method: "DELETE" });
    } else {
      await fetch(`/api/habits/${habit.id}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
    }
    setDone(!done);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-left"
    >
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${done ? "text-zinc-400 line-through" : "text-white"}`}>
          {habit.name}
        </p>
      </div>
      {habit.streak > 0 && (
        <div className="flex items-center gap-1 text-orange-400 text-xs shrink-0">
          <Flame className="w-3 h-3" />
          <span>{habit.streak}</span>
        </div>
      )}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: habit.color ?? "#6366f1" }} />
    </button>
  );
}
