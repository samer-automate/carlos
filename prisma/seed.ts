import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const exercises = [
    { name: "Press de banca", category: "push" },
    { name: "Press militar", category: "push" },
    { name: "Fondos", category: "push" },
    { name: "Aperturas con mancuernas", category: "push" },
    { name: "Extensión de tríceps", category: "push" },
    { name: "Dominadas", category: "pull" },
    { name: "Remo con barra", category: "pull" },
    { name: "Remo con mancuerna", category: "pull" },
    { name: "Curl de bíceps", category: "pull" },
    { name: "Jalón al pecho", category: "pull" },
    { name: "Sentadilla", category: "legs" },
    { name: "Peso muerto", category: "legs" },
    { name: "Prensa de piernas", category: "legs" },
    { name: "Extensión de cuádriceps", category: "legs" },
    { name: "Curl de femoral", category: "legs" },
    { name: "Gemelos de pie", category: "legs" },
    { name: "Correr", category: "cardio" },
    { name: "Bicicleta estática", category: "cardio" },
    { name: "Saltar la cuerda", category: "cardio" },
    { name: "Plancha", category: "core" },
    { name: "Crunch abdominal", category: "core" },
    { name: "Elevaciones de piernas", category: "core" },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: ex.name },
      update: {},
      create: { id: ex.name, name: ex.name, category: ex.category },
    });
  }

  console.log("Seed completado: ejercicios cargados");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
