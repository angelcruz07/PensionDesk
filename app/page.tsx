import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Calculator, Shield, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pensión Desk · Simulación IMSS para asesores",
  description:
    "Estima pensiones y escenarios de Modalidad 40 con una interfaz pensada para despachos y asesoría IMSS.",
};

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <header className="border-border supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
            Pensión Desk
          </span>
          <nav className="flex shrink-0 items-center gap-2">
            {session ? (
              <Link
                href="/calculadora"
                className={cn(buttonVariants({ size: "sm" }), "sm:h-9")}
              >
                Ir al simulador
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden sm:inline-flex"
                  )}
                >
                  Iniciar sesión
                </Link>
                <Link href="/registro" className={cn(buttonVariants({ size: "sm" }), "sm:h-9")}>
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "sm:hidden")}
                >
                  Entrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="border-border bg-muted/30 flex flex-1 flex-col items-center border-b px-4 py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase sm:text-sm">
              IMSS · Modalidad 40
            </p>
            <h1 className="font-heading text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Simulación de pensión con enfoque profesional
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-pretty text-sm leading-relaxed sm:text-base">
              Centraliza escenarios, parámetros y resultados en un solo espacio de trabajo. Pensado
              para quienes asesoran trámites y planeación previsional.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              {session ? (
                <Link
                  href="/calculadora"
                  className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                >
                  Abrir simulador
                </Link>
              ) : (
                <>
                  <Link
                    href="/registro"
                    className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                  >
                    Comenzar gratis
                  </Link>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full sm:w-auto"
                    )}
                  >
                    Ya tengo cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-14 md:py-16">
          <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            <li className="rounded-lg border border-border bg-card p-5 text-left shadow-sm">
              <span className="bg-muted text-primary mb-3 inline-flex size-9 items-center justify-center rounded-md border border-border">
                <Calculator className="size-4" aria-hidden />
              </span>
              <h2 className="font-heading text-sm font-semibold">Simulador en vivo</h2>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Ajusta semanas, UMA y factores; los resultados se recalculan al instante.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-card p-5 text-left shadow-sm">
              <span className="bg-muted text-primary mb-3 inline-flex size-9 items-center justify-center rounded-md border border-border">
                <Shield className="size-4" aria-hidden />
              </span>
              <h2 className="font-heading text-sm font-semibold">Acceso por cuenta</h2>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Tu espacio de trabajo queda reservado tras iniciar sesión.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-card p-5 text-left shadow-sm sm:col-span-1">
              <span className="bg-muted text-primary mb-3 inline-flex size-9 items-center justify-center rounded-md border border-border">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <h2 className="font-heading text-sm font-semibold">Listo para crecer</h2>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Cartera de clientes e informes llegarán como siguiente paso del producto.
              </p>
            </li>
          </ul>
        </section>

        <footer className="text-muted-foreground border-t border-border py-6 text-center text-xs">
          Pensión Desk · Herramientas para asesores IMSS
        </footer>
      </main>
    </div>
  );
}
