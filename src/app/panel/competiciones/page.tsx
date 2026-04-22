"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompetitionsFilterBar } from "@/components/panel/CompetitionsFilterBar";
import { CompetitionsTable } from "@/components/panel/CompetitionsTable";
import {
  useCompetitions,
  type CompetitionsFilters,
} from "@/hooks/use-competitions";

export default function CompetitionsListPage() {
  const [filters, setFilters] = useState<CompetitionsFilters>({});
  const { data, isLoading } = useCompetitions(filters);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Competiciones</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona todas las competiciones de la plataforma.
            </p>
          </div>
          <Button asChild>
            <Link href="/panel/competiciones/nueva">
              <Plus className="h-4 w-4 mr-2" /> Nueva competición
            </Link>
          </Button>
        </div>

        <CompetitionsFilterBar value={filters} onChange={setFilters} />

        <CompetitionsTable competitions={data ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
