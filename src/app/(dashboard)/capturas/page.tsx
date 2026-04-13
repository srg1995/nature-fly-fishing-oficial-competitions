"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CapturaForm } from "@/components/capturas/CapturaForm";
import { CapturaList } from "@/components/capturas/CapturaList";
import { useDuos } from "@/hooks/use-duos";
import { useCreateCaptura, useDeleteCaptura } from "@/hooks/use-capturas";
import { useStats } from "@/hooks/use-stats";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/dashboard/StatsCards";
import type { CreateCatchFormValues } from "@/lib/validations";
import type { RecentCatch } from "@/types";

export default function CapturasPage() {
  const { data: duos = [] } = useDuos();
  const { data: stats, isLoading: statsLoading } = useStats();
  const createCaptura = useCreateCaptura();
  const deleteCaptura = useDeleteCaptura();
  const { toast } = useToast();

  // Last 20 captured in this session (from stats recentCatches)
  const recentCatches: RecentCatch[] = stats?.recentCatches ?? [];

  const handleSubmit = async (data: CreateCatchFormValues) => {
    try {
      await createCaptura.mutateAsync({
        ...data,
        sessionId: null,
        hora: data.hora ?? null,
        juezId: null,
        observaciones: data.observaciones ?? "",
      });
      toast({
        title: "Captura registrada",
        description: `${data.longitudCm} cm · ${data.valida ? "válida" : "no válida"}`,
        variant: "success",
      } as Parameters<typeof toast>[0]);
    } catch (err) {
      toast({
        title: "Error al registrar",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCaptura.mutateAsync(id);
      toast({ title: "Captura eliminada", variant: "success" } as Parameters<typeof toast>[0]);
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Registro de Capturas</h2>
        <p className="text-muted-foreground text-sm">
          Formulario optimizado para uso en campo por jueces y guardapescas
        </p>
      </div>

      <StatsCards
        totalDuos={stats?.totalDuos ?? 0}
        totalCapturas={stats?.totalCapturas ?? 0}
        totalPuntos={stats?.totalPuntos ?? 0}
        mangasActivas={stats?.mangasActivas ?? 0}
        isLoading={statsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nueva Captura</CardTitle>
          </CardHeader>
          <CardContent>
            <CapturaForm
              duos={duos}
              onSubmit={handleSubmit}
              isLoading={createCaptura.isPending}
            />
          </CardContent>
        </Card>

        {/* Recent session captures */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Últimas Capturas
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({recentCatches.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CapturaList
              capturas={recentCatches}
              onDelete={handleDelete}
              isLoading={statsLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
