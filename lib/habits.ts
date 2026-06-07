import { startOfDay, subDays, eachDayOfInterval, format, parseISO, isToday, getDay } from "date-fns";

export function calcStreak(completionDates: Date[], frequency: string, targetDays?: string | null): number {
  if (!completionDates.length) return 0;

  const datesSet = new Set(completionDates.map((d) => format(startOfDay(d), "yyyy-MM-dd")));
  const days = JSON.parse(targetDays || "null") as number[] | null;

  let streak = 0;
  let cursor = startOfDay(new Date());

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dayOfWeek = getDay(cursor);
    const dateStr = format(cursor, "yyyy-MM-dd");
    const isExpected =
      frequency === "daily" ||
      (frequency === "weekly" && days?.includes(dayOfWeek)) ||
      (frequency === "custom" && days?.includes(dayOfWeek));

    if (isExpected) {
      if (datesSet.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function calcCompletionRate(
  completionDates: Date[],
  frequency: string,
  targetDays?: string | null,
  days = 30
): number {
  const daysArr = JSON.parse(targetDays || "null") as number[] | null;
  const datesSet = new Set(completionDates.map((d) => format(startOfDay(d), "yyyy-MM-dd")));
  const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });

  let expected = 0;
  let completed = 0;

  for (const day of interval) {
    const dow = getDay(day);
    const isExpected =
      frequency === "daily" ||
      (frequency === "weekly" && daysArr?.includes(dow)) ||
      (frequency === "custom" && daysArr?.includes(dow));

    if (isExpected) {
      expected++;
      if (datesSet.has(format(day, "yyyy-MM-dd"))) completed++;
    }
  }
  return expected === 0 ? 0 : Math.round((completed / expected) * 100);
}
