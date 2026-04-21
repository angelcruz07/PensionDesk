import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Modalidad40Calculator } from "@/app/_components/modalidad-40-calculator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ESSENTIAL_PLAN_NAME = "plan esencial";
const RECURRING_PLANS = new Set(["plan profesional", "plan despacho"]);
const ESSENTIAL_PLAN_DURATION_MS = 48 * 60 * 60 * 1000;
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
  periodEnd?: string | Date | null;
};

function isEssentialPlanExpired(subscription: ActiveSubscription) {
  if (subscription.plan.toLowerCase() !== ESSENTIAL_PLAN_NAME) return false;
  if (subscription.createdAt == null) return true;
  const createdAtDate =
    typeof subscription.createdAt === "string"
      ? new Date(subscription.createdAt)
      : subscription.createdAt;
  if (Number.isNaN(createdAtDate.getTime())) return true;
  return Date.now() - createdAtDate.getTime() > ESSENTIAL_PLAN_DURATION_MS;
}

function hasFuturePeriodEnd(subscription: ActiveSubscription) {
  if (subscription.periodEnd == null) return false;
  const periodEndDate =
    typeof subscription.periodEnd === "string"
      ? new Date(subscription.periodEnd)
      : subscription.periodEnd;
  if (Number.isNaN(periodEndDate.getTime())) return false;
  return periodEndDate.getTime() > Date.now();
}

function hasCalculatorAccess(subscription: ActiveSubscription) {
  const normalizedPlan = subscription.plan.toLowerCase();
  const normalizedStatus = subscription.status.toLowerCase();

  if (normalizedPlan === ESSENTIAL_PLAN_NAME) {
    return !isEssentialPlanExpired(subscription);
  }

  if (!RECURRING_PLANS.has(normalizedPlan)) return false;
  if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return false;
  if (SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return true;
  return hasFuturePeriodEnd(subscription);
}

function getAccessErrorCode(subscription: ActiveSubscription | null) {
  if (!subscription) return "no_plan";

  const normalizedPlan = subscription.plan.toLowerCase();
  const normalizedStatus = subscription.status.toLowerCase();

  if (normalizedPlan === ESSENTIAL_PLAN_NAME && isEssentialPlanExpired(subscription)) {
    return "expired_essential";
  }

  if (RECURRING_PLANS.has(normalizedPlan)) {
    if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) {
      return "payment_issue";
    }
    if (!SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus) && !hasFuturePeriodEnd(subscription)) {
      return "payment_issue";
    }
  }

  return "no_plan";
}

export default async function CalculadoraPage() {
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
      periodEnd: true,
    },
  })) as ActiveSubscription | null;
  if (!activeSubscription || !hasCalculatorAccess(activeSubscription)) {
    const error = getAccessErrorCode(activeSubscription);
    redirect(`/configuracion?planRequired=1&error=${error}`);
  }
  return <Modalidad40Calculator />;
}
