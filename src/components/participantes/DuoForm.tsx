"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDuoSchema, type CreateDuoFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ParticipantDuo } from "@/types";

interface DuoFormProps {
  initialValues?: Partial<ParticipantDuo>;
  onSubmit: (data: CreateDuoFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DuoForm({ initialValues, onSubmit, onCancel, isLoading }: DuoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDuoFormValues>({
    resolver: zodResolver(createDuoSchema),
    defaultValues: {
      nombreDuo: initialValues?.nombreDuo ?? "",
      pescador1: initialValues?.pescador1 ?? "",
      pescador2: initialValues?.pescador2 ?? "",
      plica: initialValues?.plica ?? "",
      tramo: initialValues?.tramo ?? "",
      rio: initialValues?.rio ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombreDuo">Nombre del Dúo *</Label>
          <Input id="nombreDuo" {...register("nombreDuo")} placeholder="Ej: Los Rápidos del Sella" />
          {errors.nombreDuo && (
            <p className="text-xs text-destructive">{errors.nombreDuo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pescador1">Pescador 1 *</Label>
            <Input id="pescador1" {...register("pescador1")} placeholder="Nombre completo" />
            {errors.pescador1 && (
              <p className="text-xs text-destructive">{errors.pescador1.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pescador2">Pescador 2 *</Label>
            <Input id="pescador2" {...register("pescador2")} placeholder="Nombre completo" />
            {errors.pescador2 && (
              <p className="text-xs text-destructive">{errors.pescador2.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="plica">Plica / Dorsal</Label>
            <Input id="plica" {...register("plica")} placeholder="Ej: A1" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tramo">Tramo</Label>
            <Input id="tramo" {...register("tramo")} placeholder="Ej: Tramo 3" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rio">Río</Label>
            <Input id="rio" {...register("rio")} placeholder="Ej: Sella" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialValues ? "Guardar cambios" : "Crear dúo"}
        </Button>
      </div>
    </form>
  );
}
