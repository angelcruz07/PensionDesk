import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Pensión Desk",
  description: "Accede a tu cuenta.",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/calculadora");
  }

  return (
    <Suspense fallback={<div className="text-muted-foreground text-center text-sm">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
