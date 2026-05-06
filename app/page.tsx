import type { Metadata } from "next";
import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import { headers } from "next/headers";
import {
  Calculator,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { subscriptionPlansCatalog } from "@/lib/subscription-plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pensión 360 · Simulación IMSS para asesores",
  description:
    "Estima pensiones y escenarios de Modalidad 40 con una interfaz pensada para despachos y asesoría IMSS.",
};

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#faf8f6] text-foreground">
      {/* fondo ambiental */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(251,191,36,0.18),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_65%_40%_at_100%_55%,rgba(14,165,233,0.08),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.7))]"
      />

      <header className="border-border/60 supports-[backdrop-filter]:bg-[#faf8f6]/75 sticky top-0 z-20 border-b bg-[#faf8f6]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AppLogo size={36} decorative priority className="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="font-heading bg-gradient-to-r from-foreground via-foreground to-amber-900/80 bg-clip-text text-base font-semibold tracking-tight text-transparent sm:text-lg">
              Pensión 360
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-2">
            {session ? (
              <Link
                href="/calculadora"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shadow-md shadow-amber-900/10 ring-2 ring-amber-900/15 sm:h-9"
                )}
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
                <Link
                  href="/registro"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "shadow-md shadow-amber-900/10 ring-2 ring-amber-900/15 sm:h-9"
                  )}
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "sm:hidden"
                  )}
                >
                  Entrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        <section className="relative flex flex-1 flex-col items-center border-b border-amber-200/40 px-4 pb-16 pt-12 sm:pb-24 sm:pt-16 md:pb-28 md:pt-20">
          {/* rejilla decorativa muy sutil */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_30%,black,transparent)]"
          />

          <div className="relative mx-auto max-w-2xl text-center md:max-w-3xl">
            <p className="text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur-sm sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              IMSS · Modalidad 40
            </p>
            <h1 className="font-heading text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-[2.85rem] md:leading-[1.12]">
              <span className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-900/90 bg-clip-text text-transparent">
                Simulación de pensión
              </span>
              <br />
              <span className="text-foreground mt-2 block text-[1.58rem] font-semibold tracking-tight sm:text-4xl md:mt-1 md:inline md:text-[2.2rem]">
                con enfoque profesional
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed sm:mt-6 sm:text-base">
              Centraliza escenarios, parámetros y resultados en un solo espacio de trabajo.
              Pensado para quienes asesoran trámites y planeación previsional.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              {session ? (
                <Link
                  href="/calculadora"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group gap-2 shadow-lg shadow-amber-950/15 ring-2 ring-amber-900/20 transition hover:shadow-xl hover:ring-amber-900/35",
                    "w-full sm:w-auto"
                  )}
                >
                  Abrir simulador
                  <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                </Link>
              ) : (
                <>
                  <Link
                    href="/registro"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group shadow-lg shadow-amber-950/20 ring-2 ring-amber-900/25 transition hover:shadow-xl hover:ring-amber-900/35",
                      "w-full sm:w-auto"
                    )}
                  >
                    Comenzar gratis
                  </Link>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "border-amber-200/90 bg-white/70 backdrop-blur-sm transition hover:border-amber-300 hover:bg-white",
                      "w-full sm:w-auto"
                    )}
                  >
                    Ya tengo cuenta
                  </Link>
                </>
              )}
            </div>

            {/* micro–prueba social / confianza */}
            <div className="text-muted-foreground mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-xs">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-600">✓</span> Cálculos en vivo
              </span>
              <span className="hidden sm:inline opacity-35" aria-hidden>
                ·
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-sky-600">✓</span> Pensado para asesores
              </span>
              <span className="hidden sm:inline opacity-35" aria-hidden>
                ·
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-neutral-700">✓</span> Acceso por cuenta
              </span>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="planes-heading"
          className="relative border-b border-amber-200/40 px-4 py-14 md:py-20"
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-10 text-center md:mb-12">
              <h2
                id="planes-heading"
                className="font-heading text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-[1.875rem]"
              >
                Planes para tu práctica
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed sm:text-base">
                Elige cobertura desde acceso puntual hasta despacho completo. Los precios indicados están
                en MXN y el cobro se gestiona de forma segura al contratar dentro de la app.
              </p>
            </div>

            <ul className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {subscriptionPlansCatalog.map((plan, index) => {
                const emphasized = index === 1;
                const planHref = session ? "/configuracion" : "/registro";
                const planButtonLabel = session ? "Gestionar en configuración" : "Crear cuenta y contratar";

                return (
                  <li
                    key={plan.name}
                    className={cn(
                      "group relative flex min-h-[320px] flex-col rounded-2xl border bg-white/90 p-6 text-left shadow-[0_8px_32px_-14px_rgba(0,0,0,0.12)] backdrop-blur-sm transition duration-300",
                      emphasized
                        ? "border-amber-400/70 ring-2 ring-amber-400/30 shadow-[0_12px_40px_-14px_rgba(180,130,70,0.35)] hover:-translate-y-1 hover:shadow-[0_20px_44px_-12px_rgba(180,130,70,0.4)] md:z-[1]"
                        : "border-white/95 hover:border-amber-200/80 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.14)] hover:-translate-y-0.5",
                    )}
                  >
                    {emphasized ? (
                      <span className="bg-gradient-to-r from-amber-600 to-amber-800 absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md shadow-amber-900/25">
                        Frecuente
                      </span>
                    ) : null}
                    <p className="text-muted-foreground text-xs leading-none tracking-wide uppercase">
                      Pensión 360
                    </p>
                    <h3 className="font-heading mt-3 text-lg font-semibold leading-tight text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-2">
                      <span className="text-foreground text-2xl font-bold tabular-nums sm:text-[1.65rem]">
                        {plan.priceLabel}
                      </span>
                      <span className="text-muted-foreground ml-2 text-sm font-medium tracking-tight">
                        MXN · {plan.billingLabel}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-4 flex-1 text-xs leading-relaxed sm:text-[0.8125rem]">
                      {plan.description}
                    </p>
                    <Link
                      href={planHref}
                      className={cn(
                        buttonVariants({
                          variant: emphasized ? "default" : "outline",
                          size: "lg",
                        }),
                        "mt-6 w-full",
                        emphasized &&
                          "shadow-md shadow-amber-900/15 ring-2 ring-amber-900/20 hover:shadow-lg",
                      )}
                    >
                      {planButtonLabel}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {!session ? (
              <p className="text-muted-foreground mt-10 text-center text-xs leading-relaxed">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
                  Inicia sesión
                </Link>{" "}
                para contratar desde Configuración.
              </p>
            ) : null}
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:py-16 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              Todo lo que incluye Pensión 360
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
              Una base sólida hoy; módulos en evolución contigo.
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            <li className="group relative rounded-2xl border border-white/90 bg-white/85 p-6 text-left shadow-[0_8px_30px_-12px_rgba(180,130,70,0.25)] backdrop-blur-sm transition duration-300 hover:border-amber-200/90 hover:shadow-[0_20px_40px_-16px_rgba(180,130,70,0.35)] hover:-translate-y-0.5">
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/15 text-amber-900 shadow-inner ring-1 ring-amber-500/25">
                <Calculator className="size-5" aria-hidden />
              </span>
              <h2 className="font-heading text-[0.9375rem] font-semibold text-foreground">
                Simulador en vivo
              </h2>
              <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed sm:text-[0.8125rem]">
                Ajusta semanas, UMA y factores; los resultados se recalculan al instante.
              </p>
            </li>
            <li className="group relative rounded-2xl border border-white/90 bg-white/85 p-6 text-left shadow-[0_8px_30px_-12px_rgba(14,116,144,0.18)] backdrop-blur-sm transition duration-300 hover:border-sky-200/90 hover:shadow-[0_20px_40px_-16px_rgba(14,116,144,0.22)] hover:-translate-y-0.5">
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/25 to-sky-600/12 text-sky-950 shadow-inner ring-1 ring-sky-400/25">
                <Shield className="size-5" aria-hidden />
              </span>
              <h2 className="font-heading text-[0.9375rem] font-semibold text-foreground">
                Acceso por cuenta
              </h2>
              <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed sm:text-[0.8125rem]">
                Tu espacio de trabajo queda reservado tras iniciar sesión.
              </p>
            </li>
            <li className="group relative rounded-2xl border border-white/90 bg-white/85 p-6 text-left shadow-[0_8px_30px_-12px_rgba(147,112,219,0.15)] backdrop-blur-sm transition duration-300 hover:border-violet-200/80 hover:shadow-[0_20px_40px_-16px_rgba(124,94,173,0.2)] hover:-translate-y-0.5 sm:col-span-1">
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400/20 to-indigo-500/15 text-violet-950 shadow-inner ring-1 ring-violet-400/25">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <h2 className="font-heading text-[0.9375rem] font-semibold text-foreground">
                Listo para crecer
              </h2>
              <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed sm:text-[0.8125rem]">
                Cartera de clientes e informes llegarán como siguiente paso del producto.
              </p>
            </li>
          </ul>
        </section>

        <footer className="border-t border-amber-200/50 bg-white/40 py-8 text-center text-xs text-muted-foreground backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <AppLogo size={48} decorative className="opacity-95" />
            <p className="font-medium text-neutral-700">Pensión 360</p>
          </div>
          <p className="mt-1 opacity-90">Herramientas para asesores IMSS</p>
        </footer>
      </main>
    </div>
  );
}
