"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Fish,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Waves,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentCompetition } from "@/hooks/use-current-competition";

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export function CompetitionSidebar() {
  const pathname = usePathname();
  const competition = useCurrentCompetition();
  const base = `/panel/competiciones/${competition.id}`;

  const navItems = [
    { href: `${base}`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/participantes`, label: "Participantes", icon: Users },
    { href: `${base}/capturas`, label: "Registro Capturas", icon: Fish },
    { href: `${base}/resultados`, label: "Resultados", icon: BarChart3 },
    { href: `${base}/clasificacion`, label: "Clasificación", icon: Trophy },
  ];

  const adminItems = [
    { href: `${base}/admin`, label: "Administración", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border">
      {/* Back to global panel */}
      <div className="p-4 pb-0">
        <Link href="/panel">
          <span className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft className="w-3 h-3" />
            Panel global
          </span>
        </Link>
      </div>

      {/* Logo + competition name */}
      <div className="p-6 pt-3 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0">
          <Waves className="w-6 h-6 text-primary" />
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {competition.nivel === "nacional"
              ? "Nacional"
              : competition.nivel === "autonomica"
              ? "Autonómica"
              : "Provincial"}
          </p>
          <p className="text-sm font-bold text-foreground truncate">
            {competition.nombre}
          </p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Competición
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === base
              ? pathname === base
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sistema
          </p>
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Separator />

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
