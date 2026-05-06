/**
 * Estados de Stripe / Better Auth que sí representan un cobro/alta efectiva de suscripción.
 * `incomplete` suele aparecer al crear cliente o abrir Checkout sin pagar — no es un plan vigente.
 */
export function stripeSubscriptionMeansEffectivelyActive(
  status: string | null | undefined
): boolean {
  const st = (status ?? "").trim().toLowerCase();
  if (
    st === "" ||
    st === "incomplete" ||
    st === "incomplete_expired" ||
    st === "canceled" ||
    st === "cancelled" ||
    st === "unpaid" ||
    st === "past_due"
  ) {
    return false;
  }
  if (st === "active" || st === "trialing") return true;
  if (st === "paused") return true;
  return false;
}
