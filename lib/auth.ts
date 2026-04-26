import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createFreemiumEssentialOnUserSignup } from "@/lib/create-freemium-essential-subscription";
import { prisma } from "@/lib/prisma";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

const subscriptionPlans = [
  {
    name: "Plan Esencial",
    priceId: process.env.STRIPE_PRICE_ID_PLAN_ESENCIAL!,
  },
  {
    name: "Plan Profesional",
    priceId: process.env.STRIPE_PRICE_ID_PLAN_PROFESIONAL!,
  },
  {
    name: "Plan Despacho",
    priceId: process.env.STRIPE_PRICE_ID_PLAN_DESPACHO!,
  },
];

const stripeSubscriptionPlans = subscriptionPlans.filter(
  (p) => (p.priceId ?? "").trim().length > 0,
);

const stripePlugin =
  stripeSecretKey != null && stripeSecretKey.length > 0
    ? (() => {
        if (!stripeWebhookSecret) {
          throw new Error(
            "Missing STRIPE_WEBHOOK_SECRET: Stripe webhooks must be signed and verified.",
          );
        }
        return stripe({
          stripeClient: new Stripe(stripeSecretKey, {
            apiVersion: "2026-03-25.dahlia",
          }),
          stripeWebhookSecret,
          createCustomerOnSignUp: true,
          ...(stripeSubscriptionPlans.length > 0
            ? {
                subscription: {
                  enabled: true,
                  plans: stripeSubscriptionPlans,
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await createFreemiumEssentialOnUserSignup(user.id);
        },
      },
    },
  },
  plugins: stripePlugin ? [stripePlugin] : [],
});
