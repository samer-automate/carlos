"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { DAY_NAMES } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  type: "habit" | "routine" | "block";
  color: string;
  completed: boolean;
  entityId: string;
};

export default function CalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async (date: Date) => {
    setLoading(true);
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
    const res = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents(currentDate);
  }, [currentDate, loadEvents]);

  async function toggleHabit(event: CalendarEvent) {
    if (event.type !== "habit") return;
    const dateStr = format(new Date(event.start), "yyyy-MM-dd");
    if (event.completed) {
      await fetch(`/api/habits/${event.entityId}/completions?date=${dateStr}`, { method: "DELETE" });
    } else {
      await fetch(`/api/habits/${event.entityId}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });
    }
    loadEvents(currentDate);
  }

  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    const key = format(new Date(ev.start), "yyyy-MM-dd");
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white capitalize">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-xs text-zinc-500 font-medium py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-zinc-800 rounded-xl overflow-hidden border border-zinc-800">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateStr] ?? [];
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              className={`min-h-[100px] p-2 ${inMonth ? "bg-zinc-950" : "bg-zinc-900"}`}
            >
              <div
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  today
                    ? "bg-indigo-600 text-white"
                    : inMonth
                    ? "text-zinc-300"
                    : "text-zinc-600"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 4).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => toggleHabit(ev)}
                    disabled={ev.type !== "habit"}
                    className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left group transition-opacity hover:opacity-80 disabled:cursor-default"
                    style={{ background: `${ev.color}22`, borderLeft: `2px solid ${ev.color}` }}
                  >
                    {ev.type === "habit" && (
                      ev.completed
                        ? <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: ev.color }} />
                        : <Circle className="w-2.5 h-2.5 shrink-0" style={{ color: ev.color }} />
                    )}
                    <span
                      className="text-xs truncate"
                      style={{ color: ev.color, textDecoration: ev.completed ? "line-through" : "none", opacity: ev.completed ? 0.6 : 1 }}
                    >
                      {ev.title}
                    </span>
                  </button>
                ))}
                {dayEvents.length > 4 && (
                  <p className="text-xs text-zinc-500 px-1">+{dayEvents.length - 4} más</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-4 text-zinc-500 text-sm">Cargando...</div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>Hábito (click para marcar)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Rutina</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Bloque</span>
        </div>
      </div>
    </div>
  );
}
