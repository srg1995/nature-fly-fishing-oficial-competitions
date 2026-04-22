"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  MapPin,
  Calendar,
  UserCircle,
  FileCheck,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCreateCompetition } from "@/hooks/use-competitions";
import {
  useComunidadesAutonomas,
  useProvincias,
} from "@/hooks/use-geografia";
import { generateSlug } from "@/lib/validations-competition";
import type { NivelCompeticion } from "@/types";

type DraftState = {
  nivel: NivelCompeticion | null;
  comunidadAutonomaId: number | null;
  provinciaId: number | null;
  nombre: string;
  edicion: string;
  modalidad: string;
  slug: string;
  slugManual: boolean;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  descripcion: string;
  organizador: string;
  totalMangas: number;
  minimaLongitud: number;
  riosText: string;
  tramosText: string;
};

const emptyDraft: DraftState = {
  nivel: null,
  comunidadAutonomaId: null,
  provinciaId: null,
  nombre: "",
  edicion: "",
  modalidad: "lance_mosca_duos",
  slug: "",
  slugManual: false,
  fechaInicio: "",
  fechaFin: "",
  lugar: "",
  descripcion: "",
  organizador: "",
  totalMangas: 4,
  minimaLongitud: 19,
  riosText: "",
  tramosText: "",
};

const steps = [
  { key: "nivel", label: "Nivel", icon: Flag },
  { key: "territorio", label: "Territorio", icon: MapPin },
  { key: "detalles", label: "Detalles", icon: Calendar },
  { key: "organizador", label: "Organizador", icon: UserCircle },
  { key: "resumen", label: "Resumen", icon: FileCheck },
] as const;

type StepKey = (typeof steps)[number]["key"];

export function NuevaCompeticionWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [stepIdx, setStepIdx] = useState(0);

  const createCompetition = useCreateCompetition();
  const { data: ccaa = [] } = useComunidadesAutonomas();
  const { data: provincias = [] } = useProvincias(
    draft.comunidadAutonomaId ?? undefined
  );

  // Si el nivel es nacional se salta la etapa 1 (territorio)
  const visibleSteps = useMemo<readonly StepKey[]>(() => {
    if (draft.nivel === "nacional") {
      return ["nivel", "detalles", "organizador", "resumen"];
    }
    return steps.map((s) => s.key);
  }, [draft.nivel]);

  const currentStep = visibleSteps[stepIdx] ?? "nivel";

  const update = (patch: Partial<DraftState>) =>
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (!next.slugManual) {
        next.slug = generateSlug(next.nombre, next.edicion);
      }
      return next;
    });

  const go = (dir: 1 | -1) => {
    setStepIdx((i) =>
      Math.min(Math.max(i + dir, 0), visibleSteps.length - 1)
    );
  };

  const stepValid = (): boolean => {
    switch (currentStep) {
      case "nivel":
        return draft.nivel !== null;
      case "territorio":
        if (draft.nivel === "autonomica") return !!draft.comunidadAutonomaId;
        if (draft.nivel === "provincial")
          return !!draft.comunidadAutonomaId && !!draft.provinciaId;
        return true;
      case "detalles":
        return (
          draft.nombre.trim().length >= 3 &&
          draft.slug.length >= 3 &&
          !!draft.fechaInicio &&
          !!draft.fechaFin &&
          draft.fechaFin >= draft.fechaInicio
        );
      case "organizador":
        return true;
      case "resumen":
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!draft.nivel) return;

    const rios = draft.riosText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tramos = draft.tramosText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const base = {
      nombre: draft.nombre.trim(),
      edicion: draft.edicion.trim(),
      modalidad: draft.modalidad.trim() || "lance_mosca_duos",
      slug: draft.slug,
      estado: "borrador" as const,
      fechaInicio: draft.fechaInicio,
      fechaFin: draft.fechaFin,
      lugar: draft.lugar.trim(),
      organizador: draft.organizador.trim(),
      organizadorUserId: null,
      totalMangas: draft.totalMangas,
      minimaLongitud: draft.minimaLongitud,
      rios,
      tramos,
      descripcion: draft.descripcion.trim(),
    };

    try {
      let payload;
      if (draft.nivel === "nacional") {
        payload = {
          ...base,
          nivel: "nacional" as const,
          comunidadAutonomaId: null,
          provinciaId: null,
        };
      } else if (draft.nivel === "autonomica") {
        if (!draft.comunidadAutonomaId) return;
        payload = {
          ...base,
          nivel: "autonomica" as const,
          comunidadAutonomaId: draft.comunidadAutonomaId,
          provinciaId: null,
        };
      } else {
        if (!draft.comunidadAutonomaId || !draft.provinciaId) return;
        payload = {
          ...base,
          nivel: "provincial" as const,
          comunidadAutonomaId: draft.comunidadAutonomaId,
          provinciaId: draft.provinciaId,
        };
      }

      const created = await createCompetition.mutateAsync(payload);
      toast({
        title: "Competición creada",
        description: created.nombre,
        variant: "success",
      } as Parameters<typeof toast>[0]);
      router.push(`/panel/competiciones/${created.id}`);
    } catch (err) {
      toast({
        title: "Error al crear competición",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {visibleSteps.map((key, i) => {
          const meta = steps.find((s) => s.key === key);
          if (!meta) return null;
          const Icon = meta.icon;
          const isDone = i < stepIdx;
          const isActive = i === stepIdx;
          return (
            <div
              key={key}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isDone
                    ? "bg-primary/10 text-primary border-primary/40"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:inline",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {meta.label}
              </span>
              {i < visibleSteps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {currentStep === "nivel" && (
            <StepNivel
              value={draft.nivel}
              onChange={(nivel) =>
                update({
                  nivel,
                  comunidadAutonomaId: null,
                  provinciaId: null,
                })
              }
            />
          )}

          {currentStep === "territorio" && draft.nivel && (
            <StepTerritorio
              nivel={draft.nivel}
              comunidadAutonomaId={draft.comunidadAutonomaId}
              provinciaId={draft.provinciaId}
              ccaa={ccaa}
              provincias={provincias}
              onChange={(patch) => update(patch)}
            />
          )}

          {currentStep === "detalles" && (
            <StepDetalles
              draft={draft}
              onChange={(patch) => update(patch)}
            />
          )}

          {currentStep === "organizador" && (
            <StepOrganizador
              draft={draft}
              onChange={(patch) => update(patch)}
            />
          )}

          {currentStep === "resumen" && (
            <StepResumen draft={draft} ccaa={ccaa} provincias={provincias} />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => go(-1)}
          disabled={stepIdx === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        {stepIdx < visibleSteps.length - 1 ? (
          <Button
            onClick={() => go(1)}
            disabled={!stepValid()}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createCompetition.isPending}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Crear competición
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────

function StepNivel({
  value,
  onChange,
}: {
  value: NivelCompeticion | null;
  onChange: (nivel: NivelCompeticion) => void;
}) {
  const options: Array<{
    key: NivelCompeticion;
    title: string;
    desc: string;
  }> = [
    {
      key: "nacional",
      title: "Nacional",
      desc: "Competición con ámbito en todo el territorio nacional.",
    },
    {
      key: "autonomica",
      title: "Autonómica",
      desc: "Competición restringida a una comunidad autónoma.",
    },
    {
      key: "provincial",
      title: "Provincial",
      desc: "Competición restringida a una provincia concreta.",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Nivel de la competición</h2>
        <p className="text-sm text-muted-foreground">
          Elige el ámbito territorial al que pertenece la competición.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            type="button"
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              "text-left rounded-xl border p-4 transition-colors",
              value === opt.key
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted"
            )}
          >
            <p className="font-semibold">{opt.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTerritorio({
  nivel,
  comunidadAutonomaId,
  provinciaId,
  ccaa,
  provincias,
  onChange,
}: {
  nivel: NivelCompeticion;
  comunidadAutonomaId: number | null;
  provinciaId: number | null;
  ccaa: Array<{ id: number; nombre: string }>;
  provincias: Array<{ id: number; nombre: string }>;
  onChange: (
    patch: Partial<{
      comunidadAutonomaId: number | null;
      provinciaId: number | null;
    }>
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Territorio</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona la comunidad autónoma
          {nivel === "provincial" && " y la provincia"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Comunidad autónoma</Label>
          <Select
            value={comunidadAutonomaId ? String(comunidadAutonomaId) : ""}
            onValueChange={(v) =>
              onChange({
                comunidadAutonomaId: v ? Number(v) : null,
                provinciaId: null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una CCAA" />
            </SelectTrigger>
            <SelectContent>
              {ccaa.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {nivel === "provincial" && (
          <div className="space-y-1.5">
            <Label>Provincia</Label>
            <Select
              disabled={!comunidadAutonomaId}
              value={provinciaId ? String(provinciaId) : ""}
              onValueChange={(v) =>
                onChange({ provinciaId: v ? Number(v) : null })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    comunidadAutonomaId
                      ? "Selecciona una provincia"
                      : "Primero elige una CCAA"
                  }
                />
              </SelectTrigger>
              <SelectContent>
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
    </div>
  );
}

function StepDetalles({
  draft,
  onChange,
}: {
  draft: DraftState;
  onChange: (patch: Partial<DraftState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Detalles</h2>
        <p className="text-sm text-muted-foreground">
          Información principal de la competición.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input
            value={draft.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            placeholder="Ej: Campeonato Nacional Salmónidos"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Edición</Label>
          <Input
            value={draft.edicion}
            onChange={(e) => onChange({ edicion: e.target.value })}
            placeholder="Ej: VI 2025"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Slug</Label>
          <Input
            value={draft.slug}
            onChange={(e) =>
              onChange({ slug: e.target.value, slugManual: true })
            }
            placeholder="Se genera automáticamente"
          />
          <p className="text-xs text-muted-foreground">
            Aparecerá en la URL pública: /competiciones/{draft.slug || "..."}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Fecha de inicio</Label>
          <Input
            type="date"
            value={draft.fechaInicio}
            onChange={(e) => onChange({ fechaInicio: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Fecha de fin</Label>
          <Input
            type="date"
            value={draft.fechaFin}
            onChange={(e) => onChange({ fechaFin: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Lugar</Label>
          <Input
            value={draft.lugar}
            onChange={(e) => onChange({ lugar: e.target.value })}
            placeholder="Ej: Boñar, León"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Modalidad</Label>
          <Input
            value={draft.modalidad}
            onChange={(e) => onChange({ modalidad: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Total de mangas</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={draft.totalMangas}
            onChange={(e) =>
              onChange({ totalMangas: Number(e.target.value) || 1 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Longitud mínima (cm)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            step={0.1}
            value={draft.minimaLongitud}
            onChange={(e) =>
              onChange({ minimaLongitud: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Ríos (separados por coma)</Label>
          <Input
            value={draft.riosText}
            onChange={(e) => onChange({ riosText: e.target.value })}
            placeholder="Ej: Río Esla, Río Porma"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Tramos (separados por coma)</Label>
          <Input
            value={draft.tramosText}
            onChange={(e) => onChange({ tramosText: e.target.value })}
            placeholder="Ej: Tramo 1 Boñar, Tramo 2 Cistierna"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Descripción</Label>
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={draft.descripcion}
            onChange={(e) => onChange({ descripcion: e.target.value })}
            placeholder="Información adicional visible en la página pública"
          />
        </div>
      </div>
    </div>
  );
}

function StepOrganizador({
  draft,
  onChange,
}: {
  draft: DraftState;
  onChange: (patch: Partial<DraftState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Organizador</h2>
        <p className="text-sm text-muted-foreground">
          Entidad o persona responsable de la competición.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Organizador</Label>
        <Input
          value={draft.organizador}
          onChange={(e) => onChange({ organizador: e.target.value })}
          placeholder="Ej: Federación Española de Pesca"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Más adelante se podrá asignar un usuario organizador concreto (admin u
        organizador) cuando el pivote de roles por competición esté disponible.
      </p>
    </div>
  );
}

function StepResumen({
  draft,
  ccaa,
  provincias,
}: {
  draft: DraftState;
  ccaa: Array<{ id: number; nombre: string }>;
  provincias: Array<{ id: number; nombre: string }>;
}) {
  const nivelLabel =
    draft.nivel === "nacional"
      ? "Nacional"
      : draft.nivel === "autonomica"
      ? "Autonómica"
      : draft.nivel === "provincial"
      ? "Provincial"
      : "—";

  const ccaaLabel = draft.comunidadAutonomaId
    ? ccaa.find((c) => c.id === draft.comunidadAutonomaId)?.nombre
    : null;
  const provinciaLabel = draft.provinciaId
    ? provincias.find((p) => p.id === draft.provinciaId)?.nombre
    : null;

  const rows: Array<[string, string]> = [
    ["Nivel", nivelLabel],
    ...(ccaaLabel ? ([["Comunidad", ccaaLabel]] as Array<[string, string]>) : []),
    ...(provinciaLabel
      ? ([["Provincia", provinciaLabel]] as Array<[string, string]>)
      : []),
    ["Nombre", draft.nombre || "—"],
    ["Edición", draft.edicion || "—"],
    ["Slug", draft.slug || "—"],
    ["Modalidad", draft.modalidad],
    ["Fechas", `${draft.fechaInicio} → ${draft.fechaFin}`],
    ["Lugar", draft.lugar || "—"],
    ["Organizador", draft.organizador || "—"],
    ["Total mangas", String(draft.totalMangas)],
    ["Longitud mínima", `${draft.minimaLongitud} cm`],
    ["Ríos", draft.riosText || "—"],
    ["Tramos", draft.tramosText || "—"],
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Resumen</h2>
        <p className="text-sm text-muted-foreground">
          Revisa los datos antes de crear la competición. Podrás publicarla
          cuando esté lista; se crea en estado <strong>borrador</strong>.
        </p>
      </div>

      <div className="divide-y rounded-xl border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[140px_1fr] gap-4 px-4 py-2.5 text-sm"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
