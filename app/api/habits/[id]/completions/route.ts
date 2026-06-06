import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay } from "date-fns";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: habitId } = await params;
  const body = await req.json();
  const date = startOfDay(body.date ? new Date(body.date) : new Date());

  try {
    const completion = await prisma.habitCompletion.create({
      data: { habitId, date, note: body.note },
    });
    return NextResponse.json(completion, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already completed" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: habitId } = await params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const date = startOfDay(dateStr ? new Date(dateStr) : new Date());

  await prisma.habitCompletion.deleteMany({ where: { habitId, date } });
  return NextResponse.json({ ok: true });
}
