"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCatchSchema, type CreateCatchFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PuntosDisplay } from "./PuntosDisplay";
import type { Participante } from "@/types";

interface CapturaFormProps {
  participantes: Participante[];
  defaultPescadorId?: string;
  defaultManga?: number;
  onSubmit: (data: CreateCatchFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function CapturaForm({
  participantes,
  defaultPescadorId,
  defaultManga,
  onSubmit,
  isLoading,
}: CapturaFormProps) {
  const [longitudPreview, setLongitudPreview] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCatchFormValues>({
    resolver: zodResolver(createCatchSchema),
    defaultValues: {
      pescadorId: defaultPescadorId ?? "",
      manga: defaultManga ?? 1,
      tramo: "",
      rio: "",
      longitudCm: undefined,
      valida: true,
      hora: "",
      observaciones: "",
    },
  });

  const longitudCmValue = watch("longitudCm");

  useEffect(() => {
    const val = Number(longitudCmValue);
    setLongitudPreview(isNaN(val) || val <= 0 ? null : val);
  }, [longitudCmValue]);

  const handleFormSubmit = async (data: CreateCatchFormValues) => {
    await onSubmit(data);
    reset({ ...data, longitudCm: undefined, hora: "", observaciones: "" });
    setLongitudPreview(null);
  };

  const selectedPescador = participantes.find((p) => p.id === watch("pescadorId"));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Pescador selection */}
      <div className="space-y-1.5">
        <Label>Pescador *</Label>
        <Select
          value={watch("pescadorId")}
          onValueChange={(val) => setValue("pescadorId", val)}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Seleccionar pescador…" />
          </SelectTrigger>
          <SelectContent>
            {participantes.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className="font-medium">{p.nombre}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  #{p.plica} · {p.club}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.pescadorId && (
          <p className="text-xs text-destructive">{errors.pescadorId.message}</p>
        )}
        {selectedPescador && (
          <p className="text-xs text-muted-foreground">
            Plica: <strong>{selectedPescador.plica || "—"}</strong> · Tramo:{" "}
            <strong>{selectedPescador.tramo || "—"}</strong>
          </p>
        )}
      </div>

      {/* Manga + Hora */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="manga">Manga *</Label>
          <Input
            id="manga"
            type="number"
            min={1}
            max={10}
            className="h-12 text-base"
            {...register("manga", { valueAsNumber: true })}
          />
          {errors.manga && <p className="text-xs text-destructive">{errors.manga.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hora">Hora captura</Label>
          <Input id="hora" type="time" className="h-12 text-base" {...register("hora")} />
        </div>
      </div>

      {/* Tramo + Río */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tramo">Tramo</Label>
          <Input id="tramo" className="h-12" {...register("tramo")} placeholder="Ej: Tramo 2" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rio">Río</Label>
          <Input id="rio" className="h-12" {...register("rio")} placeholder="Ej: Sella" />
        </div>
      </div>

      {/* Longitud — the key field */}
      <div className="space-y-1.5">
        <Label htmlFor="longitudCm" className="text-base font-semibold">
          Longitud (cm) *
        </Label>
        <Input
          id="longitudCm"
          type="number"
          step="0.5"
          min="1"
          max="200"
          className="h-14 text-2xl font-bold text-center"
          placeholder="0"
          {...register("longitudCm", { valueAsNumber: true })}
        />
        {errors.longitudCm && (
          <p className="text-xs text-destructive">{errors.longitudCm.message}</p>
        )}
      </div>

      {/* Points preview */}
      <PuntosDisplay longitudCm={longitudPreview} />

      {/* Valid switch */}
      <div className="flex items-center justify-between p-4 rounded-xl border">
        <div>
          <p className="text-sm font-medium">Captura válida</p>
          <p className="text-xs text-muted-foreground">
            Desactiva si la captura no es válida por reglamento
          </p>
        </div>
        <Switch
          checked={watch("valida")}
          onCheckedChange={(val) => setValue("valida", val)}
        />
      </div>

      {/* Observaciones */}
      <div className="space-y-1.5">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Input
          id="observaciones"
          {...register("observaciones")}
          placeholder="Notas adicionales…"
        />
      </div>

      <Button type="submit" size="xl" className="w-full" loading={isLoading}>
        Registrar Captura
      </Button>
    </form>
  );
}
