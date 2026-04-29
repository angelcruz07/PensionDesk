import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { ESSENTIAL_PLAN_NAME, normalizePlanName } from "@/lib/essential-plan";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

const stripeSubscriptionPlans = [
  { name: "Plan Esencial", priceId: process.env.STRIPE_PRICE_ID_PLAN_ESENCIAL },
  { name: "Plan Profesional", priceId: process.env.STRIPE_PRICE_ID_PLAN_PROFESIONAL },
  { name: "Plan Despacho", priceId: process.env.STRIPE_PRICE_ID_PLAN_DESPACHO },
]
  .map((plan) => ({
    name: plan.name,
    priceId: (plan.priceId ?? "").trim(),
  }))
  .filter(
    (plan): plan is { name: string; priceId: string } => plan.priceId.length > 0,
  );

const stripePlugin =
  stripeSecretKey != null && stripeSecretKey.length > 0
    ? (() => {
        if (!stripeWebhookSecret) {
          throw new Error(
            "Missing STRIPE_WEBHOOK_SECRET: Stripe webhooks must be signed and verified.",
          );
        }
        const stripeClient = new Stripe(stripeSecretKey, {
          apiVersion: "2026-04-22.dahlia",
        });

        async function ensureEssentialNoRenewal(
          plan: { name?: string } | undefined,
          stripeSubscription: { id: string; cancel_at_period_end?: boolean | null },
        ) {
          const name = plan?.name ?? "";
          if (!name || normalizePlanName(name) !== ESSENTIAL_PLAN_NAME) return;
          if (stripeSubscription.cancel_at_period_end) return;
          await stripeClient.subscriptions.update(stripeSubscription.id, {
            cancel_at_period_end: true,
          });
        }

        return stripe({
          stripeClient,
          stripeWebhookSecret,
          createCustomerOnSignUp: true,
          ...(stripeSubscriptionPlans.length > 0
            ? {
                subscription: {
                  enabled: true,
                  plans: stripeSubscriptionPlans,
                  onSubscriptionComplete: async ({ stripeSubscription, plan }) => {
                    await ensureEssentialNoRenewal(plan as { name?: string }, stripeSubscription);
                  },
                  onSubscriptionCreated: async ({ stripeSubscription, plan }) => {
                    await ensureEssentialNoRenewal(plan as { name?: string }, stripeSubscription);
                  },
                },
              }
            : {}),
        });
      })()
    : null;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: stripePlugin ? [stripePlugin] : [],
});
