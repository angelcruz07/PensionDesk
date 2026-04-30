import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
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
import { UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordCard } from "./_components/change-password-card";
import { SubscriptionCard } from "./_components/subscription-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración · Pensión 360",
  description: "Perfil, suscripción y seguridad de la cuenta.",
};

const PAGE =
  "mx-auto w-full max-w-screen-2xl px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8 md:py-10";

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams?: Promise<{ planRequired?: string; error?: string }>;
}) {
  noStore();
  const session = await auth.api.getSession({ headers: await headers() });
  let serverSubscription: {
    plan: string;
    status: string;
    createdAt: string;
    periodStart: string | null;
    updatedAt: string;
    periodEnd: string | null;
  } | null = null;
  if (session?.user) {
    const row = await prisma.subscription.findFirst({
      where: { referenceId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        plan: true,
        status: true,
        createdAt: true,
        periodStart: true,
        updatedAt: true,
        periodEnd: true,
      },
    });
    if (row) {
      serverSubscription = {
        plan: row.plan,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        periodStart: row.periodStart ? row.periodStart.toISOString() : null,
        updatedAt: row.updatedAt.toISOString(),
        periodEnd: row.periodEnd ? row.periodEnd.toISOString() : null,
      };
    }
  }
  const resolvedSearchParams = await searchParams;
  const forcePlanSelection = resolvedSearchParams?.planRequired === "1";
  const accessError = resolvedSearchParams?.error;

  const profileName = session?.user?.name?.trim() ?? "";
  const profileEmail = session?.user?.email?.trim() ?? "";

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
          Tu nombre y correo provienen de la sesión. La edición del perfil estará disponible
          próximamente; ya puedes cambiar tu contraseña en la sección Seguridad.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:gap-8 xl:grid-cols-2 xl:items-start">
        <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
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
                    defaultValue={profileName || "—"}
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
                    defaultValue={profileEmail || "—"}
                    disabled
                    className="h-10 w-full bg-muted/40"
                    autoComplete="email"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs sm:max-w-[55%]">
                Solo lectura: los datos siguen tu sesión de Better Auth. La edición llegará próximamente.
              </p>
              <Button type="button" disabled className="shrink-0 sm:ml-auto">
                Guardar perfil
              </Button>
            </CardFooter>
          </Card>

          <ChangePasswordCard />
        </div>

        <SubscriptionCard
          forcePlanSelection={forcePlanSelection}
          accessError={accessError}
          serverSubscription={serverSubscription}
        />
      </div>
    </div>
  );
}
