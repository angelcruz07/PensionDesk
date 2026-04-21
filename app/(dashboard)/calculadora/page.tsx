import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Modalidad40Calculator } from "@/app/_components/modalidad-40-calculator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ESSENTIAL_PLAN_NAME = "plan esencial";
const ESSENTIAL_PLAN_DURATION_MS = 48 * 60 * 60 * 1000;

type ActiveSubscription = {
  plan: string;
  createdAt?: string | Date | null;
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
      status: { in: ["active", "trialing"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      plan: true,
      createdAt: true,
    },
  })) as ActiveSubscription | null;
  if (activeSubscription && isEssentialPlanExpired(activeSubscription)) {
    redirect("/configuracion?planRequired=1");
  }
  return <Modalidad40Calculator />;
}
