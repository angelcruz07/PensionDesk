"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegistroForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const displayName =
        name.trim() || email.trim().split("@")[0] || "Usuario";
      const { error: signError } = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: displayName,
        callbackURL: "/calculadora",
      });
      if (signError) {
        setError(signError.message ?? "No se pudo crear la cuenta.");
        return;
      }
      router.push("/calculadora");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl tracking-tight">Crear cuenta</CardTitle>
        <CardDescription>Regístrate con correo y contraseña.</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-destructive text-sm leading-snug" role="alert">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="reg-nombre">Nombre</Label>
            <Input
              id="reg-nombre"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Correo electrónico</Label>
            <Input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Contraseña</Label>
            <Input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="text-muted-foreground text-xs">Mínimo 8 caracteres.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
            <Input
              id="reg-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-center text-xs sm:text-left">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
              Iniciar sesión
            </Link>
          </p>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creando cuenta…" : "Registrarse"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
