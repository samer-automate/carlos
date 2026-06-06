import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BlockDetailClient from "@/components/blocks/BlockDetailClient";

export const dynamic = "force-dynamic";

export default async function BlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [block, habits, routines] = await Promise.all([
    prisma.block.findUnique({
      where: { id },
      include: {
        habits: { include: { habit: true }, orderBy: { order: "asc" } },
        routines: { include: { routine: true }, orderBy: { order: "asc" } },
        schedules: true,
      },
    }),
    prisma.habit.findMany({ where: { archived: false }, orderBy: { name: "asc" } }),
    prisma.routine.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!block) notFound();

  return <BlockDetailClient block={block} allHabits={habits} allRoutines={routines} />;
}
