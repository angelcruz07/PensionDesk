import {
  ESSENTIAL_PLAN_NAME,
  isEssentialPlanExpired,
  normalizePlanName,
} from "@/lib/essential-plan";
import { prisma } from "@/lib/prisma";
import { stripeSubscriptionMeansEffectivelyActive } from "@/lib/stripe-subscription-status";

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

/** Misma forma que devuelve la consulta para /calculadora y reportes PDF. */
export type CalculadoraSubscriptionRow = {
  plan: string;
  status: string;
  createdAt?: string | Date | null;
  periodStart?: string | Date | null;
  updatedAt?: string | Date | null;
  periodEnd?: string | Date | null;
};

function hasFuturePeriodEnd(subscription: CalculadoraSubscriptionRow) {
  if (subscription.periodEnd == null) return false;
  const periodEndDate =
    typeof subscription.periodEnd === "string"
      ? new Date(subscription.periodEnd)
      : subscription.periodEnd;
  if (Number.isNaN(periodEndDate.getTime())) return false;
  return periodEndDate.getTime() > Date.now();
}

export type CalculadoraAccessErrorCode =
  | "no_plan"
  | "expired_essential"
  | "payment_issue";

function getRecurringAccessErrorCode(
  subscription: CalculadoraSubscriptionRow
): CalculadoraAccessErrorCode {
  const normalizedStatus = subscription.status.toLowerCase();
  const periodEnded =
    subscription.periodEnd != null && !hasFuturePeriodEnd(subscription);
  if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return "payment_issue";
  if (SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus) && periodEnded) {
    return "payment_issue";
  }
  if (
    !SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus) &&
    !hasFuturePeriodEnd(subscription)
  ) {
    return "payment_issue";
  }
  return "no_plan";
}

/** Solo Profesional / Despacho: estados y periodEnd; no aplica a Plan Esencial. */
function hasRecurringPlanAccess(subscription: CalculadoraSubscriptionRow) {
  const normalizedStatus = subscription.status.toLowerCase();
  const periodEnded =
    subscription.periodEnd != null && !hasFuturePeriodEnd(subscription);
  if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return false;
  if (SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return !periodEnded;
  return hasFuturePeriodEnd(subscription);
}

export async function fetchCalculadoraSubscription(userId: string) {
  return (await prisma.subscription.findFirst({
    where: {
      referenceId: userId,
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
  })) as CalculadoraSubscriptionRow | null;
}

export function userHasCalculadoraAccess(
  subscription: CalculadoraSubscriptionRow | null
): boolean {
  if (!subscription) return false;

  const plan = normalizePlanName(subscription.plan);

  if (plan === ESSENTIAL_PLAN_NAME) {
    return (
      stripeSubscriptionMeansEffectivelyActive(subscription.status) &&
      !isEssentialPlanExpired(subscription)
    );
  }

  if (RECURRING_PLANS.has(plan)) {
    return hasRecurringPlanAccess(subscription);
  }

  return false;
}

/**
 * Razón HTTP/UI cuando {@link userHasCalculadoraAccess} es falso (misma política que /calculadora).
 */
export function getCalculadoraAccessErrorCode(
  subscription: CalculadoraSubscriptionRow | null
): CalculadoraAccessErrorCode {
  if (!subscription) return "no_plan";

  const plan = normalizePlanName(subscription.plan);

  if (plan === ESSENTIAL_PLAN_NAME) {
    if (!stripeSubscriptionMeansEffectivelyActive(subscription.status)) {
      return "no_plan";
    }
    return isEssentialPlanExpired(subscription) ? "expired_essential" : "no_plan";
  }

  if (RECURRING_PLANS.has(plan)) {
    return getRecurringAccessErrorCode(subscription);
  }

  return "no_plan";
}
