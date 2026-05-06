import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = {
  title: "Registro · Pensión 360",
  description: "Crea tu cuenta.",
};

export default async function RegistroPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/seleccionar-plan");
  }

  return <RegistroForm />;
}
