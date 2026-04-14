"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const target =
        rawCallback &&
        rawCallback.startsWith("/") &&
        !rawCallback.startsWith("//") &&
        rawCallback !== "/"
          ? rawCallback
          : "/calculadora";
      const { error: signError } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: target,
      });
      if (signError) {
        setError(signError.message ?? "No se pudo iniciar sesión.");
        return;
      }
      router.push(target);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl tracking-tight">Inicia sesión en tu cuenta</CardTitle>
          <CardDescription>
            Introduce tu correo y contraseña para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-5">
              {error ? (
                <p className="text-destructive text-sm leading-snug" role="alert">
                  {error}
                </p>
              ) : null}
              <Field>
                <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="login-password" className="flex-1">
                    Contraseña
                  </FieldLabel>
                  <span
                    className="text-muted-foreground cursor-not-allowed text-sm underline-offset-4"
                    title="Disponible próximamente"
                  >
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field className="gap-3">
                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading ? "Entrando…" : "Iniciar sesión"}
                </Button>
                <FieldDescription className="text-center">
                  ¿No tienes cuenta?{" "}
                  <Link href="/registro" className="text-foreground font-medium">
                    Registrarse
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
