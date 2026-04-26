import { auth } from "@/lib/auth";
import { ESSENTIAL_PLAN_NAME, isEssentialPlanExpired, normalizePlanName } from "@/lib/essential-plan";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

/**
 * Al recomprar Plan Esencial pasadas 48h, la suscripción en Stripe puede seguir "active" con
 * el mismo price id: better-auth intentaría un update sin cambios y falla. Este endpoint
 * cancela la suscripción antigua y marca la fila en BD, para que el checkout siguiente sea
 * como un alta nueva.
 */
export async function POST() {
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe no está configurado." }, { status: 500 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const sub = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!sub) {
    return NextResponse.json({ error: "No hay suscripción asociada." }, { status: 400 });
  }

  if (normalizePlanName(sub.plan) !== ESSENTIAL_PLAN_NAME) {
    return NextResponse.json(
      { error: "Solo aplica al Plan Esencial en estado expirado (48h)." },
      { status: 400 },
    );
  }

  if (!isEssentialPlanExpired(sub)) {
    return NextResponse.json(
      { error: "El Plan Esencial aún no ha expirado según la regla de 48 horas." },
      { status: 400 },
    );
  }

  if (!sub.stripeSubscriptionId?.trim()) {
    return NextResponse.json({ ok: true, didCancelOnStripe: false });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2026-03-25.dahlia" });

  try {
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code !== "resource_missing" && !err.message?.toLowerCase().includes("canceled")) {
      return NextResponse.json(
        { error: err.message ?? "No se pudo cancelar la suscripción previa en Stripe." },
        { status: 502 },
      );
    }
  }

  const now = new Date();
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "canceled",
      canceledAt: sub.canceledAt ?? now,
      endedAt: sub.endedAt ?? now,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    },
  });

  return NextResponse.json({ ok: true, didCancelOnStripe: true });
}
