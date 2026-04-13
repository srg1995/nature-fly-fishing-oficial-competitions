"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useParticipantes,
  useCreateParticipante,
  useUpdateParticipante,
  useDeleteParticipante,
} from "@/hooks/use-participantes";
import { useToast } from "@/hooks/use-toast";
import type { Participante, CreateParticipanteInput } from "@/types";
import { useForm } from "react-hook-form";

export default function ParticipantesPage() {
  const { data: participantes = [], isLoading } = useParticipantes();
  const createParticipante = useCreateParticipante();
  const updateParticipante = useUpdateParticipante();
  const deleteParticipante = useDeleteParticipante();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Participante | null>(null);
  const [search, setSearch] = useState("");

  const filtered = participantes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.plica.includes(search) ||
      p.club.toLowerCase().includes(search.toLowerCase())
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateParticipanteInput>();

  const handleOpenCreate = () => {
    setEditing(null);
    reset({ nombre: "", plica: "", club: "", tramo: "", rio: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (p: Participante) => {
    setEditing(p);
    reset({ nombre: p.nombre, plica: p.plica, club: p.club, tramo: p.tramo, rio: p.rio });
    setDialogOpen(true);
  };

  const handleSubmitForm = async (data: CreateParticipanteInput) => {
    try {
      if (editing) {
        await updateParticipante.mutateAsync({ id: editing.id, data });
        toast({ title: "Participante actualizado", variant: "success" } as Parameters<typeof toast>[0]);
      } else {
        await createParticipante.mutateAsync(data);
        toast({ title: "Participante añadido", variant: "success" } as Parameters<typeof toast>[0]);
      }
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParticipante.mutateAsync(id);
      toast({ title: "Participante eliminado", variant: "success" } as Parameters<typeof toast>[0]);
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const isPending = createParticipante.isPending || updateParticipante.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Participantes</h2>
          <p className="text-muted-foreground text-sm">{participantes.length} pescadores registrados</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Participante
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, plica o club..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {search ? "No se encontraron resultados" : "No hay participantes registrados"}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-bold text-sm flex-shrink-0">
                  #{p.plica}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.nombre}</p>
                  <p className="text-xs text-muted-foreground">{p.club}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">{p.rio}</Badge>
                    <span className="text-xs text-muted-foreground">{p.tramo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleteParticipante.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Participante" : "Nuevo Participante"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre completo</label>
              <Input
                {...register("nombre", { required: "El nombre es obligatorio" })}
                placeholder="Ej: Carlos Rodríguez Vega"
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Plica (dorsal)</label>
                <Input
                  {...register("plica", { required: "La plica es obligatoria" })}
                  placeholder="Ej: 01"
                />
                {errors.plica && (
                  <p className="text-xs text-destructive">{errors.plica.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Club</label>
                <Input
                  {...register("club")}
                  placeholder="Ej: SD Pesca León"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Río</label>
                <Input
                  {...register("rio")}
                  placeholder="Ej: Río Esla"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tramo</label>
                <Input
                  {...register("tramo")}
                  placeholder="Ej: Tramo 1 - Boñar"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
