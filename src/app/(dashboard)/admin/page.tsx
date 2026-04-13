"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Shield, Clock, Plus, Trash2, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { User, AuditEntry, UserRole } from "@/types";
import { formatDate } from "@/lib/utils";

const rolLabels: Record<UserRole, string> = {
  admin: "Administrador",
  organizador: "Organizador",
  juez: "Juez",
};

const rolVariants: Record<UserRole, "destructive" | "secondary" | "outline"> = {
  admin: "destructive",
  organizador: "secondary",
  juez: "outline",
};

function UserForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: { email: string; nombre: string; password: string; rol: UserRole }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<UserRole>("juez");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, nombre, password, rol });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre completo</Label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Contraseña</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Rol</Label>
        <Select value={rol} onValueChange={(v) => setRol(v as UserRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="juez">Juez</SelectItem>
            <SelectItem value="organizador">Organizador</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={isLoading}>Crear usuario</Button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const json = (await res.json()) as { data: User[] };
      return json.data;
    },
  });

  const { data: auditLog = [], isLoading: auditLoading, refetch: refetchAudit } = useQuery({
    queryKey: ["audit"],
    queryFn: async () => {
      const res = await fetch("/api/audit");
      if (!res.ok) throw new Error("Error al cargar auditoría");
      const json = (await res.json()) as { data: AuditEntry[] };
      return json.data;
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: { email: string; nombre: string; password: string; rol: UserRole }) => {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error: string };
        throw new Error(err.error);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setUserDialogOpen(false);
      toast({ title: "Usuario creado", variant: "success" } as Parameters<typeof toast>[0]);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Usuario eliminado" });
    },
  });

  const accionLabel: Record<string, string> = {
    CREATE_DUO: "Crear dúo",
    UPDATE_DUO: "Editar dúo",
    DELETE_DUO: "Eliminar dúo",
    CREATE_CATCH: "Registrar captura",
    UPDATE_CATCH: "Editar captura",
    DELETE_CATCH: "Eliminar captura",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Administración
        </h2>
        <p className="text-muted-foreground text-sm">
          Gestión de usuarios y registro de actividad
        </p>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="gap-2">
            <Clock className="w-4 h-4" />
            Auditoría
          </TabsTrigger>
        </TabsList>

        {/* ── Usuarios ── */}
        <TabsContent value="usuarios" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{users.length} usuarios registrados</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={() => setUserDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo usuario
              </Button>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Rol</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4].map((j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{u.nombre}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={rolVariants[u.rol]}>{rolLabels[u.rol]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará a <strong>{u.nombre}</strong> ({u.email}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => deleteUser.mutate(u.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Auditoría ── */}
        <TabsContent value="auditoria" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Últimas 100 acciones</p>
            <Button variant="outline" size="sm" onClick={() => refetchAudit()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>

          <div className="space-y-2">
            {auditLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
                ))
              : auditLog.map((entry) => (
                  <Card key={entry.id} className="py-0">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {accionLabel[entry.accion] ?? entry.accion}
                          </Badge>
                          {entry.tabla && (
                            <span className="text-xs text-muted-foreground">{entry.tabla}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create user dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={(data) => createUser.mutateAsync(data)}
            onCancel={() => setUserDialogOpen(false)}
            isLoading={createUser.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
