import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import RoutineDetailClient from "@/components/routines/RoutineDetailClient";

export const dynamic = "force-dynamic";

export default async function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [routine, exercises] = await Promise.all([
    prisma.routine.findUnique({
      where: { id },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: "asc" } },
        schedules: true,
      },
    }),
    prisma.exercise.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!routine) notFound();

  return <RoutineDetailClient routine={routine} allExercises={exercises} />;
}
