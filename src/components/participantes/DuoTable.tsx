"use client";

import { useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ParticipantDuo } from "@/types";

interface DuoTableProps {
  duos: ParticipantDuo[];
  onEdit: (duo: ParticipantDuo) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function DuoTable({ duos, onEdit, onDelete, isLoading }: DuoTableProps) {
  const [search, setSearch] = useState("");

  const filtered = duos.filter(
    (d) =>
      d.nombreDuo.toLowerCase().includes(search.toLowerCase()) ||
      d.pescador1.toLowerCase().includes(search.toLowerCase()) ||
      d.pescador2.toLowerCase().includes(search.toLowerCase()) ||
      d.plica.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por dúo, pescador o plica…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Plica</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Dúo</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Pescador 1</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Pescador 2</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tramo</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Río</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "No se encontraron resultados" : "No hay dúos registrados"}
                  </td>
                </tr>
              ) : (
                filtered.map((duo) => (
                  <tr key={duo.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      {duo.plica ? (
                        <Badge variant="outline" className="font-mono">
                          {duo.plica}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{duo.nombreDuo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{duo.pescador1}</td>
                    <td className="px-4 py-3 text-muted-foreground">{duo.pescador2}</td>
                    <td className="px-4 py-3 text-muted-foreground">{duo.tramo || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{duo.rio || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(duo)}
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:text-destructive"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar dúo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará el dúo <strong>{duo.nombreDuo}</strong> y todas sus
                                capturas asociadas. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => onDelete(duo.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && (
        <p className="text-xs text-muted-foreground text-right">
          {filtered.length} de {duos.length} dúos
        </p>
      )}
    </div>
  );
}
