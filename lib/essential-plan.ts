/** Idéntico al nombre almacenado en BD / Stripe plugin (en minúsculas). */
export const ESSENTIAL_PLAN_NAME = "plan esencial";
export const ESSENTIAL_PLAN_DURATION_MS = 48 * 60 * 60 * 1000;

/** Misma lógica en todos los sitios: evita desajuste si en BD quedan espacios. */
export function normalizePlanName(plan: string) {
  return plan.trim().toLowerCase();
}

export type EssentialPlanExpiryCheck = {
  plan: string;
  /** Inicio del periodo (freemium o fila creada en checkout); ancla del reloj de 48 h. */
  createdAt?: string | Date | null;
};

/**
 * Regla: Plan Esencial deja de dar acceso pasadas 48 h desde `createdAt` (inicio en BD,
 * p. ej. alta freemium o fila creada al pagar de nuevo), sin usar `status` ni `periodEnd`.
 */
export function isEssentialPlanExpired(sub: EssentialPlanExpiryCheck) {
  if (normalizePlanName(sub.plan) !== ESSENTIAL_PLAN_NAME) return false;
  if (sub.createdAt == null) return true;
  const createdAtDate = typeof sub.createdAt === "string" ? new Date(sub.createdAt) : sub.createdAt;
  if (Number.isNaN(createdAtDate.getTime())) return true;
  return Date.now() - createdAtDate.getTime() > ESSENTIAL_PLAN_DURATION_MS;
}
