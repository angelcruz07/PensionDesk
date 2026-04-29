import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Pensión 360",
  description: "Accede a tu cuenta.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawCallbackUrl = resolvedSearchParams?.callbackUrl;
  const callbackUrl =
    rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/calculadora";

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect(callbackUrl);
  }

  return (
    <Suspense fallback={<div className="text-muted-foreground text-center text-sm">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
