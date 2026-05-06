import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  SubscriptionCard,
  type ServerSubscriptionSnapshot,
} from "@/app/(dashboard)/configuracion/_components/subscription-card";
import { OnboardingSignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function SeleccionarPlanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/seleccionar-plan");
  }

  let serverSubscription: ServerSubscriptionSnapshot = null;
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

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <header className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
        <OnboardingSignOutButton />
      </header>
      <div className="flex w-full max-w-5xl flex-col items-center gap-8">
        <Link
          href="/"
          className="outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Pensión 360 — inicio"
        >
          <AppLogo size={64} decorative priority />
        </Link>
        <SubscriptionCard
          forcePlanSelection
          accessError="no_plan"
          serverSubscription={serverSubscription}
          redirectAfterPayment="/calculadora"
          loginCallbackUrl="/seleccionar-plan"
          hideBillingPortal
          hideRenewalAlerts
        />
      </div>
    </main>
  );
}
