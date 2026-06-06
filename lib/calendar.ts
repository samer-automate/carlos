import { eachDayOfInterval, getDay, format, startOfDay } from "date-fns";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "habit" | "routine" | "block";
  color: string;
  completed: boolean;
  entityId: string;
};

export function buildCalendarEvents(
  start: Date,
  end: Date,
  habits: Array<{ id: string; name: string; color: string | null; frequency: string; targetDays: string | null; completions: Array<{ date: Date }> }>,
  routines: Array<{ id: string; name: string; color: string | null; schedules: Array<{ dayOfWeek: number }> }>,
  blocks: Array<{ id: string; name: string; color: string | null; schedules: Array<{ dayOfWeek: number }> }>
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const days = eachDayOfInterval({ start, end });

  for (const day of days) {
    const dow = getDay(day);
    const dateStr = format(day, "yyyy-MM-dd");

    for (const habit of habits) {
      const targetDays = habit.targetDays ? (JSON.parse(habit.targetDays) as number[]) : null;
      const isScheduled =
        habit.frequency === "daily" ||
        (habit.frequency !== "daily" && targetDays?.includes(dow));

      if (isScheduled) {
        const completed = habit.completions.some(
          (c) => format(startOfDay(c.date), "yyyy-MM-dd") === dateStr
        );
        events.push({
          id: `habit-${habit.id}-${dateStr}`,
          title: habit.name,
          start: new Date(day),
          end: new Date(day),
          type: "habit",
          color: habit.color || "#6366f1",
          completed,
          entityId: habit.id,
        });
      }
    }

    for (const routine of routines) {
      if (routine.schedules.some((s) => s.dayOfWeek === dow)) {
        events.push({
          id: `routine-${routine.id}-${dateStr}`,
          title: routine.name,
          start: new Date(day),
          end: new Date(day),
          type: "routine",
          color: routine.color || "#10b981",
          completed: false,
          entityId: routine.id,
        });
      }
    }

    for (const block of blocks) {
      if (block.schedules.some((s) => s.dayOfWeek === dow)) {
        events.push({
          id: `block-${block.id}-${dateStr}`,
          title: block.name,
          start: new Date(day),
          end: new Date(day),
          type: "block",
          color: block.color || "#f59e0b",
          completed: false,
          entityId: block.id,
        });
      }
    }
  }

  return events;
}
