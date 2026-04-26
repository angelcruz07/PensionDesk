import { randomUUID } from "node:crypto";
import { ESSENTIAL_PLAN_NAME } from "@/lib/essential-plan";
import { prisma } from "@/lib/prisma";

/**
 * Alta freemium: 48 h de acceso a la calculadora según `createdAt`, sin Stripe.
 * El status `incomplete` evita el error "already subscribed" de @better-auth/stripe al
 * pagar: el plugin reutiliza filas en ese estado; `active` haría imposible el primer checkout.
 * El acceso en app lo define `isEssentialPlanExpired`, no el string de status.
 */
export async function createFreemiumEssentialOnUserSignup(userId: string) {
  const existing = await prisma.subscription.findFirst({
    where: { referenceId: userId },
  });
  if (existing) return;

  await prisma.subscription.create({
    data: {
      id: randomUUID(),
      plan: ESSENTIAL_PLAN_NAME,
      referenceId: userId,
      status: "incomplete",
    },
  });
}
