"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, TrendingUp, ArrowLeft, Trash2 } from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";
import { format, subYears, eachDayOfInterval, startOfDay } from "date-fns";

type Props = {
  habit: { id: string; name: string; description: string | null; color: string | null; frequency: string; targetDays?: string };
  streak: number;
  rates: { r7: number; r30: number; r90: number };
  completedDates: string[];
};

export default function HabitDetailClient({ habit, streak, rates, completedDates }: Props) {
  const router = useRouter();
  const completedSet = new Set(completedDates);

  const calendarData = eachDayOfInterval({
    start: subYears(startOfDay(new Date()), 1),
    end: startOfDay(new Date()),
  }).map((d) => {
    const dateStr = format(d, "yyyy-MM-dd");
    const count = completedSet.has(dateStr) ? 1 : 0;
    return { date: dateStr, count, level: count };
  });

  async function deleteHabit() {
    if (!confirm("¿Archivar este hábito?")) return;
    await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
    router.push("/habits");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/habits" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ background: habit.color ?? "#6366f1" }} />
            <h2 className="text-2xl font-bold text-white">{habit.name}</h2>
          </div>
          {habit.description && <p className="text-zinc-400 text-sm mt-1">{habit.description}</p>}
        </div>
        <button onClick={deleteHabit} className="text-zinc-600 hover:text-red-400 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} value={streak} label="Racha actual" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} value={`${rates.r7}%`} label="7 días" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-indigo-400" />} value={`${rates.r30}%`} label="30 días" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} value={`${rates.r90}%`} label="90 días" />
      </div>

      {/* Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Historial del último año</h3>
        <div className="overflow-x-auto">
          <ActivityCalendar
            data={calendarData}
            colorScheme="dark"
            theme={{ dark: ["#27272a", habit.color ?? "#6366f1"] }}
            showTotalCount={false}
            labels={{ months: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"], weekdays: ["D","L","M","X","J","V","S"], totalCount: "" }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
