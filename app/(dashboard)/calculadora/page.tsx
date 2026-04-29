import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { Modalidad40Calculator } from "@/app/_components/modalidad-40-calculator";
import { auth } from "@/lib/auth";
import {
  ESSENTIAL_PLAN_NAME,
  isEssentialPlanExpired,
  normalizePlanName,
} from "@/lib/essential-plan";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RECURRING_PLANS = new Set(["plan profesional", "plan despacho"]);
const SUCCESS_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const BLOCKED_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "cancelled",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
]);

type ActiveSubscription = {
  plan: string;
  status: string;
  createdAt?: string | Date | null;
  periodStart?: string | Date | null;
  updatedAt?: string | Date | null;
  periodEnd?: string | Date | null;
};

function hasFuturePeriodEnd(subscription: ActiveSubscription) {
  if (subscription.periodEnd == null) return false;
  const periodEndDate =
    typeof subscription.periodEnd === "string"
      ? new Date(subscription.periodEnd)
      : subscription.periodEnd;
  if (Number.isNaN(periodEndDate.getTime())) return false;
  return periodEndDate.getTime() > Date.now();
}

/** Solo Profesional / Despacho: estados y periodEnd; no aplica a Plan Esencial. */
function hasRecurringPlanAccess(subscription: ActiveSubscription) {
  const normalizedStatus = subscription.status.toLowerCase();
  const periodEnded =
    subscription.periodEnd != null && !hasFuturePeriodEnd(subscription);
  if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return false;
  if (SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return !periodEnded;
  return hasFuturePeriodEnd(subscription);
}

function getRecurringAccessErrorCode(subscription: ActiveSubscription) {
  const normalizedStatus = subscription.status.toLowerCase();
  if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return "payment_issue";
  if (!SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus) && !hasFuturePeriodEnd(subscription)) {
    return "payment_issue";
  }
  return "no_plan";
}

export default async function CalculadoraPage() {
  noStore();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login?callbackUrl=/calculadora");
  }
  const activeSubscription = (await prisma.subscription.findFirst({
    where: {
      referenceId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      plan: true,
      status: true,
      createdAt: true,
      periodStart: true,
      updatedAt: true,
      periodEnd: true,
    },
  })) as ActiveSubscription | null;

  if (!activeSubscription) {
    redirect("/configuracion?planRequired=1&error=no_plan");
  }

  const plan = normalizePlanName(activeSubscription.plan);

  if (plan === ESSENTIAL_PLAN_NAME) {
    if (isEssentialPlanExpired(activeSubscription)) {
      redirect("/configuracion?planRequired=1&error=expired_essential");
    }
    return <Modalidad40Calculator />;
  }

  if (RECURRING_PLANS.has(plan)) {
    if (!hasRecurringPlanAccess(activeSubscription)) {
      const error = getRecurringAccessErrorCode(activeSubscription);
      redirect(`/configuracion?planRequired=1&error=${error}`);
    }
    return <Modalidad40Calculator />;
  }

  redirect("/configuracion?planRequired=1&error=no_plan");
}
