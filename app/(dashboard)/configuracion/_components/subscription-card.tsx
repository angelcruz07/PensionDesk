"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { AlertCircle, AlertTriangle, CreditCard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ESSENTIAL_PLAN_NAME, isEssentialPlanExpired, normalizePlanName } from "@/lib/essential-plan";
import { subscriptionPlans as subscriptionPlansConfig } from "@/lib/subscription-plans";

const subscriptionPlans = [
  {
    name: "Plan Esencial",
    priceLabel: "$249",
    billingLabel: "Pago unico",
    description:
      "Acceso individual a la calculadora por un tiempo limitado (48 horas). Sin descarga de documentos.",
  },
  {
    name: "Plan Profesional",
    priceLabel: "$699",
    billingLabel: "Mensual",
    description:
      "Acceso ilimitado a la calculadora y generación de reportes en PDF personalizados con la identidad visual del agente.",
  },
  {
    name: "Plan Despacho",
    priceLabel: "$1,499",
    billingLabel: "Mensual",
    description:
      "Gestión de cartera de clientes (CRM), historial de cálculos y sistema automatizado de seguimiento vía correo electrónico.",
  },
];

type ActiveSub = {
  plan: string;
  status: string;
  createdAt?: string | Date | null;
  periodEnd?: string | Date | null;
};

type AccessErrorCode = "expired_essential" | "payment_issue" | "no_plan";

/** Snapshot desde Prisma (Server Component) para primer pintado y coherencia tras Checkout. */
export type ServerSubscriptionSnapshot = {
  plan: string;
  status: string;
  createdAt: string;
  periodEnd: string | null;
} | null;

const ESSENTIAL_PLAN_DISPLAY = "Plan Esencial";

function titleCasePlan(plan: string) {
  return plan
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function statusLabel(status: string, plan?: string) {
  const s = status.toLowerCase();
  const planLower = (plan ?? "").toLowerCase();
  if (s === "incomplete" && planLower === ESSENTIAL_PLAN_DISPLAY.toLowerCase()) {
    return "Prueba gratuita (48 h)";
  }
  if (s === "active") return "Activo";
  if (s === "trialing") return "Periodo de prueba";
  if (s === "past_due") return "Pago vencido";
  if (s === "canceled") return "Cancelado";
  if (s === "incomplete") return "Incompleto";
  return status;
}

function formatRenewal(periodEnd: string | Date | null | undefined) {
  if (periodEnd == null) return "—";
  const d = typeof periodEnd === "string" ? new Date(periodEnd) : periodEnd;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", { dateStyle: "long" });
}

function toActiveSub(s: ServerSubscriptionSnapshot | undefined): ActiveSub | null {
  if (s == null) return null;
  return {
    plan: s.plan,
    status: s.status,
    createdAt: s.createdAt,
    periodEnd: s.periodEnd,
  };
}

function sortSubsNewestFirst(list: ActiveSub[]): ActiveSub[] {
  return [...list].sort((a, b) => {
    const ta =
      a.createdAt == null
        ? 0
        : typeof a.createdAt === "string"
          ? new Date(a.createdAt).getTime()
          : a.createdAt.getTime();
    const tb =
      b.createdAt == null
        ? 0
        : typeof b.createdAt === "string"
          ? new Date(b.createdAt).getTime()
          : b.createdAt.getTime();
    return tb - ta;
  });
}

function applySubscriptionRow(
  first: ActiveSub | undefined,
  setActiveSub: (v: ActiveSub | null) => void,
  setExpiredEssential: (v: boolean) => void,
) {
  if (!first) {
    setActiveSub(null);
    setExpiredEssential(false);
    return;
  }
  const isExpired = isEssentialPlanExpired(first);
  setExpiredEssential(isExpired);
  setActiveSub(isExpired ? null : first);
}

export function SubscriptionCard({
  forcePlanSelection = false,
  accessError,
  serverSubscription = null,
}: {
  forcePlanSelection?: boolean;
  accessError?: string;
  serverSubscription?: ServerSubscriptionSnapshot;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(() => {
    const a = toActiveSub(serverSubscription);
    if (!a) return null;
    return isEssentialPlanExpired(a) ? null : a;
  });
  const [expiredEssentialPlan, setExpiredEssentialPlan] = useState(() => {
    const a = toActiveSub(serverSubscription);
    return a ? isEssentialPlanExpired(a) : false;
  });
  const [listPending, setListPending] = useState(!serverSubscription);
  const [listError, setListError] = useState<string | null>(null);
  const [portalPending, setPortalPending] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  const plansForUi = useMemo(() => {
    const dataByName = new Map(subscriptionPlans.map((plan) => [plan.name, plan]));
    return subscriptionPlansConfig.map((plan) => ({
      ...plan,
      priceLabel: dataByName.get(plan.name)?.priceLabel ?? "$0",
      billingLabel: dataByName.get(plan.name)?.billingLabel ?? "Mensual",
      description: dataByName.get(plan.name)?.description ?? "",
      brand: "Pension Desk",
    }));
  }, []);

  const refreshSubscriptions = useCallback(async () => {
    if (!session?.user) {
      setActiveSub(null);
      setExpiredEssentialPlan(false);
      setListPending(false);
      return;
    }
    setListError(null);
    const { data, error } = await authClient.subscription.list();
    if (error) {
      const detail =
        error.message ||
        ("status" in error && typeof error.status === "number"
          ? `Error ${error.status}`
          : null);
      setListError(detail ?? "No se pudo cargar la suscripción.");
      setListPending(false);
      setActiveSub(null);
      return;
    }
    const list = sortSubsNewestFirst(Array.isArray(data) ? (data as ActiveSub[]) : []);
    const first = list[0] as ActiveSub | undefined;
    if (!first) {
      setActiveSub(null);
      setExpiredEssentialPlan(false);
      setListPending(false);
    } else {
      // Regla de negocio: Plan Esencial solo dura 48 horas desde su creación.
      applySubscriptionRow(first, setActiveSub, setExpiredEssentialPlan);
      setListPending(false);
    }
    router.refresh();
  }, [session?.user, router]);

  const serverKey = serverSubscription
    ? `${serverSubscription.plan}:${serverSubscription.createdAt}`
    : "none";

  useLayoutEffect(() => {
    if (serverSubscription) {
      applySubscriptionRow(
        toActiveSub(serverSubscription) ?? undefined,
        setActiveSub,
        setExpiredEssentialPlan,
      );
      setListPending(false);
    }
  }, [serverKey, serverSubscription]);

  useEffect(() => {
    void refreshSubscriptions();
  }, [refreshSubscriptions]);

  const serverSub = toActiveSub(serverSubscription);
  const serverSaysEssentialStillValid = Boolean(
    serverSub && normalizePlanName(serverSub.plan) === ESSENTIAL_PLAN_NAME && !isEssentialPlanExpired(serverSub),
  );
  /** Fila a mostrar: el cliente o, si aún no llegó, el snapshot del servidor (misma carga de Stripe). */
  const displaySub: ActiveSub | null = (() => {
    if (activeSub != null) return activeSub;
    if (serverSub == null) return null;
    if (normalizePlanName(serverSub.plan) === ESSENTIAL_PLAN_NAME) {
      return isEssentialPlanExpired(serverSub) ? null : serverSub;
    }
    return serverSub;
  })();

  const subscriptionBodyLoading =
    (sessionPending && !serverSubscription) ||
    (Boolean(session?.user) && listPending && !serverSubscription);
  const showEssentialExpiredNotice =
    expiredEssentialPlan && !serverSaysEssentialStillValid && !subscriptionBodyLoading;
  const showActive = Boolean(
    session?.user && displaySub && !subscriptionBodyLoading,
  );
  const showPlans =
    Boolean(session?.user) && !subscriptionBodyLoading && !displaySub && plansForUi.length > 0;

  const handleBillingPortal = async () => {
    setPortalPending(true);
    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/configuracion`
        : "/configuracion";
    const { error } = await authClient.subscription.billingPortal({
      returnUrl,
    });
    setPortalPending(false);
    if (error) {
      setListError(error.message ?? "No se pudo abrir el portal de facturación.");
    }
  };

  const handleSubscribe = async (planName: string) => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/configuracion");
      return;
    }
    setCheckoutPlan(planName);
    setListError(null);
    const needResetForEssentialRebuy =
      planName === ESSENTIAL_PLAN_DISPLAY &&
      expiredEssentialPlan &&
      (serverSub == null || isEssentialPlanExpired(serverSub));
    if (needResetForEssentialRebuy) {
      const res = await fetch("/api/subscription/reset-expired-essential", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        let msg = "No se pudo preparar la renovación del Plan Esencial.";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) msg = body.error;
        } catch {
          /* ignore */
        }
        setCheckoutPlan(null);
        setListError(msg);
        return;
      }
    }
    const { error } = await authClient.subscription.upgrade({
      plan: planName,
      successUrl: "/configuracion",
      cancelUrl: "/configuracion",
    });
    setCheckoutPlan(null);
    if (error) {
      setListError(error.message ?? "No se pudo iniciar el checkout.");
    }
  };

  const normalizedAccessError = (accessError ?? "").toLowerCase();
  const redirectErrorCode: AccessErrorCode =
    normalizedAccessError === "expired_essential" || normalizedAccessError === "payment_issue"
      ? normalizedAccessError
      : "no_plan";
  const alertCode: AccessErrorCode | null = forcePlanSelection ? redirectErrorCode : null;
  const alertUi =
    alertCode === "payment_issue"
      ? {
          className:
            "flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800",
          icon: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />,
          message:
            "Hubo un problema con tu pago o tu suscripción está inactiva. Actualiza tu plan para recuperar el acceso.",
        }
      : alertCode === "expired_essential"
        ? {
            className:
              "flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800",
            icon: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />,
            message:
              "Tu acceso de 48 horas ha concluido. Elige un plan mensual para seguir usando la calculadora y generar reportes.",
          }
        : alertCode === "no_plan"
          ? {
              className:
                "flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800",
              icon: <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />,
              message: "Selecciona un plan para comenzar a usar PensionDesk.",
            }
          : null;

  return (
    <Card className="min-w-0 border-border shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/12 text-amber-800 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <CreditCard className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-lg">Suscripción</CardTitle>
            <CardDescription>Plan, facturación y estado del servicio.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertUi ? (
          <div className={alertUi.className}>
            {alertUi.icon}
            <p>{alertUi.message}</p>
          </div>
        ) : null}
        {listError ? (
          <p className="text-destructive text-xs leading-relaxed">{listError}</p>
        ) : null}
        {showEssentialExpiredNotice ? (
          <p className="text-amber-700 text-xs leading-relaxed">
            Tu Plan Esencial expiró porque superó las 48 horas desde su activación. Puedes
            suscribirte nuevamente o cambiar a un plan recurrente.
          </p>
        ) : null}

        {subscriptionBodyLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="cfg-plan">Plan</Label>
              <div className="bg-muted/40 h-10 w-full animate-pulse rounded-md border border-border" />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="cfg-estado">Estado</Label>
              <div className="bg-muted/40 h-10 w-full animate-pulse rounded-md border border-border" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cfg-renovacion">Próxima renovación</Label>
              <div className="bg-muted/40 h-10 w-full animate-pulse rounded-md border border-border" />
            </div>
          </div>
        ) : null}

        {showActive && displaySub ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="cfg-plan">Plan</Label>
                <Input
                  id="cfg-plan"
                  readOnly
                  value={titleCasePlan(displaySub.plan)}
                  className="h-10 w-full bg-muted/40"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="cfg-estado">Estado</Label>
                <Input
                  id="cfg-estado"
                  readOnly
                  value={statusLabel(displaySub.status, displaySub.plan)}
                  className="h-10 w-full bg-muted/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-renovacion">Próxima renovación</Label>
              <Input
                id="cfg-renovacion"
                readOnly
                value={formatRenewal(displaySub.periodEnd)}
                className="h-10 w-full bg-muted/40"
              />
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Gestiona métodos de pago e historial desde el portal seguro de Stripe.
            </p>
          </>
        ) : null}

        {showPlans ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {plansForUi.map((plan) => (
                <div
                  key={plan.name}
                  className="flex h-full flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3"
                >
                  <p className="text-muted-foreground text-xs leading-none">{plan.brand}</p>
                  <p className="text-sm font-medium leading-snug">{plan.name}</p>
                  <p className="text-muted-foreground text-sm leading-none">
                    {plan.priceLabel} MXN - {plan.billingLabel}
                  </p>
                  <p className="text-muted-foreground flex-1 text-xs leading-relaxed">
                    {plan.description}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={checkoutPlan !== null}
                    onClick={() => void handleSubscribe(plan.name)}
                  >
                    {checkoutPlan === plan.name ? "Redirigiendo…" : "Suscribirse"}
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              El pago se procesa de forma segura con Stripe Checkout. Tras completar el pago
              volverás a esta página.
            </p>
          </>
        ) : null}

        {!session?.user && !sessionPending ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {plansForUi.map((plan) => (
                <div
                  key={plan.name}
                  className="flex h-full flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3"
                >
                  <p className="text-muted-foreground text-xs leading-none">{plan.brand}</p>
                  <p className="text-sm font-medium leading-snug">{plan.name}</p>
                  <p className="text-muted-foreground text-sm leading-none">
                    {plan.priceLabel} MXN - {plan.billingLabel}
                  </p>
                  <p className="text-muted-foreground flex-1 text-xs leading-relaxed">
                    {plan.description}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    variant="secondary"
                    onClick={() => router.push("/login?callbackUrl=/configuracion")}
                  >
                    Suscribirse
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Inicia sesión para contratar un plan. El cobro se realiza con Stripe.
            </p>
          </>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
        {showActive ? (
          <>
            <p className="text-muted-foreground hidden text-xs sm:max-w-[55%] sm:block">
              Facturación y métodos de pago se configuran en el portal de Stripe.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:ml-auto sm:w-auto"
              disabled={portalPending}
              onClick={() => void handleBillingPortal()}
            >
              {portalPending ? "Abriendo portal…" : "Gestionar plan"}
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-xs sm:max-w-[70%]">
            {session?.user
              ? "Los planes mostrados usan los precios configurados en Stripe."
              : "Accede con tu cuenta para activar una suscripción."}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
