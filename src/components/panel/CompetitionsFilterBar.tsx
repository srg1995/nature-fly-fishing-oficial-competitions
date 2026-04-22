"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompetitionsFilters } from "@/hooks/use-competitions";
import { useComunidadesAutonomas, useProvincias } from "@/hooks/use-geografia";
import type { EstadoCompeticion, NivelCompeticion } from "@/types";

interface Props {
  value: CompetitionsFilters;
  onChange: (next: CompetitionsFilters) => void;
}

const nivelOptions: Array<{ value: NivelCompeticion; label: string }> = [
  { value: "nacional", label: "Nacional" },
  { value: "autonomica", label: "Autonómica" },
  { value: "provincial", label: "Provincial" },
];

const estadoOptions: Array<{ value: EstadoCompeticion; label: string }> = [
  { value: "borrador", label: "Borrador" },
  { value: "publicada", label: "Publicada" },
  { value: "en_curso", label: "En curso" },
  { value: "finalizada", label: "Finalizada" },
  { value: "archivada", label: "Archivada" },
];

export function CompetitionsFilterBar({ value, onChange }: Props) {
  const { data: ccaa = [] } = useComunidadesAutonomas();
  const { data: provincias = [] } = useProvincias(value.comunidadAutonomaId);

  const set = <K extends keyof CompetitionsFilters>(
    key: K,
    next: CompetitionsFilters[K]
  ) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-card border rounded-lg">
      <div className="md:col-span-2">
        <Label htmlFor="search" className="text-xs text-muted-foreground">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            value={value.search ?? ""}
            onChange={(e) =>
              set("search", e.target.value ? e.target.value : undefined)
            }
            placeholder="Nombre o slug"
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Nivel</Label>
        <Select
          value={value.nivel ?? "all"}
          onValueChange={(v) =>
            set("nivel", v === "all" ? undefined : (v as NivelCompeticion))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {nivelOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Estado</Label>
        <Select
          value={value.estado ?? "all"}
          onValueChange={(v) =>
            set("estado", v === "all" ? undefined : (v as EstadoCompeticion))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {estadoOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">CCAA</Label>
        <Select
          value={
            value.comunidadAutonomaId !== undefined
              ? String(value.comunidadAutonomaId)
              : "all"
          }
          onValueChange={(v) => {
            if (v === "all") {
              onChange({
                ...value,
                comunidadAutonomaId: undefined,
                provinciaId: undefined,
              });
            } else {
              onChange({
                ...value,
                comunidadAutonomaId: Number(v),
                provinciaId: undefined,
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ccaa.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.comunidadAutonomaId !== undefined && (
        <div className="md:col-span-5">
          <Label className="text-xs text-muted-foreground">Provincia</Label>
          <Select
            value={
              value.provinciaId !== undefined
                ? String(value.provinciaId)
                : "all"
            }
            onValueChange={(v) =>
              set("provinciaId", v === "all" ? undefined : Number(v))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {provincias.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
