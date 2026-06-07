import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const exercises = await prisma.exercise.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const exercise = await prisma.exercise.create({
    data: { name: body.name, category: body.category, notes: body.notes },
  });
  return NextResponse.json(exercise, { status: 201 });
}
