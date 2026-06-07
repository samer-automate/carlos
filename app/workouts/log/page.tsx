import WorkoutLogClient from "@/components/workouts/WorkoutLogClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LogWorkoutPage({ searchParams }: { searchParams: Promise<{ routineId?: string }> }) {
  const { routineId } = await searchParams;

  const [exercises, routine] = await Promise.all([
    prisma.exercise.findMany({ orderBy: { name: "asc" } }),
    routineId
      ? prisma.routine.findUnique({
          where: { id: routineId },
          include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
        })
      : null,
  ]);

  return <WorkoutLogClient exercises={exercises} routine={routine} />;
}
