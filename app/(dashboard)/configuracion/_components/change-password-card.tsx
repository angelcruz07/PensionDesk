"use client";

import { type FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { KeyRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD_LENGTH = 8;

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (error) {
      setErrorMessage(error.message ?? "No se pudo actualizar la contraseña.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccessMessage("Contraseña actualizada correctamente.");
  };

  return (
    <Card className="min-w-0 border-border shadow-sm xl:col-span-2">
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-800 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <KeyRound className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-lg">Seguridad</CardTitle>
              <CardDescription>Contraseña y opciones de acceso.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="cfg-password-actual">Contraseña actual</Label>
              <Input
                id="cfg-password-actual"
                type="password"
                value={currentPassword}
                onChange={(ev) => setCurrentPassword(ev.target.value)}
                autoComplete="current-password"
                required
                className="h-10 w-full"
                disabled={pending}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="cfg-password-nueva">Nueva contraseña</Label>
              <Input
                id="cfg-password-nueva"
                type="password"
                value={newPassword}
                onChange={(ev) => setNewPassword(ev.target.value)}
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                className="h-10 w-full"
                disabled={pending}
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
              />
            </div>
          </div>
          <div className="max-w-md space-y-2 sm:max-w-none">
            <Label htmlFor="cfg-password-confirmar">Confirmar nueva contraseña</Label>
            <Input
              id="cfg-password-confirmar"
              type="password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              autoComplete="new-password"
              required
              className="h-10 w-full sm:max-w-md"
              disabled={pending}
            />
          </div>
          <Separator />
          {errorMessage ? (
            <p className="text-destructive text-xs leading-relaxed" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="text-emerald-700 text-xs leading-relaxed" role="status">
              {successMessage}
            </p>
          ) : null}
          <p className="text-muted-foreground max-w-4xl text-xs leading-relaxed">
            Al guardar, se cierran las demás sesiones activas de tu cuenta en otros dispositivos.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 sm:flex-row sm:items-center sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Actualizando…" : "Actualizar contraseña"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
