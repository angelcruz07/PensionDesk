/** Nombre, precios UI y texto; mismos `name` que en `lib/auth.ts` → `stripeSubscriptionPlans`. */
export type SubscriptionPlanCatalogEntry = {
  name: string;
  priceLabel: string;
  billingLabel: string;
  description: string;
};

/** Catálogo completo (stripe cobra los precios reales según tus price IDs). */
export const subscriptionPlansCatalog: SubscriptionPlanCatalogEntry[] = [
  {
    name: "Plan Esencial",
    priceLabel: "$249",
    billingLabel: "Pago único",
    description:
      "Acceso individual a la calculadora por un tiempo limitado (48 horas). Sin descarga de documentos.",
  },
  {
    name: "Plan Profesional",
    priceLabel: "$699",
    billingLabel: "Mensual",
    description:
      "Acceso ilimitado a la calculadora y generación de reportes en PDF personalizados con la identidad visual del agente.",
  },
  {
    name: "Plan Despacho",
    priceLabel: "$1,499",
    billingLabel: "Mensual",
    description:
      "Gestión de cartera de clientes (CRM), historial de cálculos y sistema automatizado de seguimiento vía correo electrónico.",
  },
];

/** Etiquetas solo nombre (p. ej. uniones tipadas en UI). */
export const subscriptionPlans = subscriptionPlansCatalog.map((plan) => ({ name: plan.name }));
