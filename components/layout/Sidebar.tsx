"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Dumbbell,
  ListChecks,
  Layers,
  Calendar,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Hábitos", icon: Target },
  { href: "/workouts", label: "Entrenamientos", icon: Dumbbell },
  { href: "/routines", label: "Rutinas", icon: ListChecks },
  { href: "/blocks", label: "Bloques", icon: Layers },
  { href: "/calendar", label: "Calendario", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="px-6 py-5 border-b border-zinc-800">
        <h1 className="text-lg font-bold text-white tracking-tight">Carlos Pro</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Hábitos & Entrenamiento</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
