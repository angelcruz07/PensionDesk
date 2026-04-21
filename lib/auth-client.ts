import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [stripeClient({ subscription: true })],
});
