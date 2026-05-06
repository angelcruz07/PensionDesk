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
  /** Inicio de periodo reportado por Stripe/better-auth al activar o renovar. */
  periodStart?: string | Date | null;
  /**
   * Respaldo cuando el proveedor actualiza la misma fila de suscripción:
   * `updatedAt` cambia aunque `createdAt` permanezca igual.
   */
  updatedAt?: string | Date | null;
};

/**
 * Regla: Plan Esencial deja de dar acceso pasadas 48 h desde `createdAt` (inicio en BD,
 * p. ej. alta freemium o fila creada al pagar de nuevo), sin usar `status` ni `periodEnd`.
 */
export function isEssentialPlanExpired(sub: EssentialPlanExpiryCheck) {
  if (normalizePlanName(sub.plan) !== ESSENTIAL_PLAN_NAME) return false;
  const parseDate = (value?: string | Date | null) => {
    if (value == null) return null;
    const dateValue = typeof value === "string" ? new Date(value) : value;
    return Number.isNaN(dateValue.getTime()) ? null : dateValue;
  };

  // Usa la fecha de activación más reciente disponible para reiniciar correctamente la ventana.
  const effectiveStart =
    parseDate(sub.periodStart) ?? parseDate(sub.updatedAt) ?? parseDate(sub.createdAt);
  if (effectiveStart == null) return true;

  return Date.now() - effectiveStart.getTime() > ESSENTIAL_PLAN_DURATION_MS;
}
