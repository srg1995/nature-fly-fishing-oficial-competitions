"use client";

import { useState } from "react";
import { Plus, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DuoForm } from "@/components/participantes/DuoForm";
import { DuoTable } from "@/components/participantes/DuoTable";
import { useDuos, useCreateDuo, useUpdateDuo, useDeleteDuo } from "@/hooks/use-duos";
import { useToast } from "@/hooks/use-toast";
import type { ParticipantDuo } from "@/types";
import type { CreateDuoFormValues } from "@/lib/validations";

export default function ParticipantesPage() {
  const { data: duos = [], isLoading } = useDuos();
  const createDuo = useCreateDuo();
  const updateDuo = useUpdateDuo();
  const deleteDuo = useDeleteDuo();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ParticipantDuo | null>(null);

  const handleOpenCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (duo: ParticipantDuo) => {
    setEditing(duo);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateDuoFormValues) => {
    try {
      if (editing) {
        await updateDuo.mutateAsync({ id: editing.id, data });
        toast({ title: "Dúo actualizado", variant: "success" } as Parameters<typeof toast>[0]);
      } else {
        await createDuo.mutateAsync(data);
        toast({ title: "Dúo creado correctamente", variant: "success" } as Parameters<typeof toast>[0]);
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
      await deleteDuo.mutateAsync(id);
      toast({ title: "Dúo eliminado", variant: "success" } as Parameters<typeof toast>[0]);
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/importar", { method: "POST", body: formData });
      const json = (await res.json()) as { data: { success: number; errors: { row: number; message: string }[] } };
      toast({
        title: `Importación completada`,
        description: `${json.data.success} dúos importados. ${json.data.errors.length} errores.`,
      });
    } catch {
      toast({ title: "Error al importar", variant: "destructive" });
    }

    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Participantes</h2>
          <p className="text-muted-foreground text-sm">{duos.length} dúos registrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="import-file">
            <input
              id="import-file"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" asChild>
              <span className="cursor-pointer gap-2 flex items-center">
                <Upload className="w-4 h-4" />
                Importar Excel
              </span>
            </Button>
          </label>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Dúo
          </Button>
        </div>
      </div>

      {/* Table */}
      <DuoTable
        duos={duos}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Dúo" : "Nuevo Dúo"}</DialogTitle>
          </DialogHeader>
          <DuoForm
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={createDuo.isPending || updateDuo.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
