import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { KeyRound, UserRound } from "lucide-react";
import { SubscriptionCard } from "./_components/subscription-card";

export const metadata: Metadata = {
  title: "Configuración · Pensión Desk",
  description: "Perfil, suscripción y seguridad de la cuenta.",
};

const PAGE =
  "mx-auto w-full max-w-screen-2xl px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 md:py-10";

/** Valores solo demostrativos hasta que exista autenticación y sesión. */
export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams?: Promise<{ planRequired?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const forcePlanSelection = resolvedSearchParams?.planRequired === "1";
  return (
    <div className={PAGE}>
      <div className="mb-6 space-y-2 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Configuración
          </h1>
          <Badge variant="secondary" className="font-normal">
            Vista previa
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-4xl text-pretty text-sm leading-relaxed lg:text-base">
          Aquí podrás gestionar tu perfil, suscripción y contraseña cuando el inicio de sesión
          esté disponible. Por ahora los campos son de demostración y no se guardan datos.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:gap-8 xl:grid-cols-2 xl:items-start">
        <Card className="min-w-0 border-border shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <UserRound className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <CardTitle className="text-lg">Perfil</CardTitle>
                <CardDescription>Nombre y correo de contacto de la cuenta.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="cfg-nombre">Nombre</Label>
                <Input
                  id="cfg-nombre"
                  name="nombre"
                  type="text"
                  defaultValue="Invitado · ejemplo"
                  disabled
                  className="h-10 w-full bg-muted/40"
                  autoComplete="name"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="cfg-correo">Correo electrónico</Label>
                <Input
                  id="cfg-correo"
                  name="email"
                  type="email"
                  defaultValue="usuario@ejemplo.com"
                  disabled
                  className="h-10 w-full bg-muted/40"
                  autoComplete="email"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs sm:max-w-[55%]">
              Los cambios requieren sesión iniciada (próximamente).
            </p>
            <Button type="button" disabled className="shrink-0 sm:ml-auto">
              Guardar perfil
            </Button>
          </CardFooter>
        </Card>

        <SubscriptionCard forcePlanSelection={forcePlanSelection} />

        <Card className="min-w-0 border-border shadow-sm xl:col-span-2">
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
                <Label htmlFor="cfg-actual">Contraseña actual</Label>
                <Input
                  id="cfg-actual"
                  type="password"
                  defaultValue="••••••••"
                  disabled
                  className="h-10 w-full bg-muted/40"
                  autoComplete="current-password"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="cfg-nueva">Nueva contraseña</Label>
                <Input
                  id="cfg-nueva"
                  type="password"
                  placeholder="Disponible con login"
                  disabled
                  className="h-10 w-full bg-muted/40"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Separator />
            <p className="text-muted-foreground max-w-4xl text-xs leading-relaxed">
              El cambio de contraseña y la autenticación en dos pasos llegarán cuando integremos
              cuentas y sesiones.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" disabled className="w-full sm:w-auto">
              Actualizar contraseña
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
