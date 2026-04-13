"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Waves, Fish } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error: string };
        setError(json.error ?? "Credenciales incorrectas");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-river-900 via-river-800 to-forest-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur">
              <Waves className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">VI Campeonato Nacional</h1>
          <p className="text-river-200 mt-1 text-sm">
            Salmónidos Lance Mosca Dúos
          </p>
        </div>

        {/* Login card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Accede con tus credenciales de juez u organizador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="h-11"
                  {...register("email")}
                  placeholder="juez@campeonato.es"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-11"
                  {...register("password")}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                <Fish className="w-4 h-4 mr-2" />
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-river-300 text-xs">
          Sistema de gestión de competiciones · Captura y Suelta Absoluta
        </p>
      </div>
    </div>
  );
}
