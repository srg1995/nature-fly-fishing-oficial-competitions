"use client";

import { usePathname } from "next/navigation";
import { Menu, Waves } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileSidebar } from "./MobileSidebar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/participantes": "Gestión de Participantes",
  "/capturas": "Registro de Capturas",
  "/resultados": "Tabla de Resultados",
  "/clasificacion": "Clasificación en Vivo",
  "/admin": "Administración",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Campeonato Salmónidos";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile menu */}
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <Waves className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">Salmónidos 2024</span>
        </div>

        {/* Page title */}
        <h1 className="hidden lg:block text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
