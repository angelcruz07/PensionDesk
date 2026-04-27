import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ESSENTIAL_PLAN_NAME,
  isEssentialPlanExpired,
  normalizePlanName,
} from "@/lib/essential-plan";
import { prisma } from "@/lib/prisma";

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

function hasRecurringPlanAccess(subscription: ActiveSubscription) {
  const normalizedStatus = subscription.status.toLowerCase();
  if (BLOCKED_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return false;
  if (SUCCESS_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return true;
  return hasFuturePeriodEnd(subscription);
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ hasAccess: false, error: "unauthorized" }, { status: 401 });
  }

  const activeSubscription = (await prisma.subscription.findFirst({
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
  })) as ActiveSubscription | null;

  if (!activeSubscription) {
    return NextResponse.json({ hasAccess: false, error: "no_plan" });
  }

  const plan = normalizePlanName(activeSubscription.plan);
  if (plan === ESSENTIAL_PLAN_NAME) {
    return NextResponse.json({
      hasAccess: !isEssentialPlanExpired(activeSubscription),
      error: isEssentialPlanExpired(activeSubscription) ? "expired_essential" : null,
    });
  }

  if (RECURRING_PLANS.has(plan)) {
    const hasAccess = hasRecurringPlanAccess(activeSubscription);
    return NextResponse.json({
      hasAccess,
      error: hasAccess ? null : "payment_issue",
    });
  }

  return NextResponse.json({ hasAccess: false, error: "no_plan" });
}
