"use client";

import { useMemo, useId, useState, type ComponentType } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calcDerived } from "@/lib/modalidad-40/formulas";
import { cloneDefaultModalidadInputs } from "@/lib/modalidad-40/defaults";
import type { ModalidadInputs } from "@/lib/modalidad-40/formulas";
import {
  formatCurrency,
  formatInteger,
  formatNumber,
  formatPercentFromRate,
} from "@/lib/format";
import { NumericField } from "./numeric-field";
import {
  Activity,
  Calculator,
  CalendarClock,
  Landmark,
  PiggyBank,
  RotateCcw,
  Sliders,
  Sparkles,
  TableProperties,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

/** Ancho fluido; paddings más ajustados en móvil (patrón dashboard shadcn). */
const PAGE_WRAP =
  "mx-auto w-full max-w-screen-2xl px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12";

const PAGE_NAV = [
  { id: "captura-datos", label: "Parámetros" },
  { id: "resultados-escenario", label: "Resultado y escenario" },
  { id: "plan-mod40", label: "Plan Modalidad 40" },
  { id: "finanzas-proyeccion", label: "Finanzas y proyección" },
  { id: "tabla-250", label: "250 semanas" },
] as const;

/** Enlaces compactos hacia secciones del panel principal. */
function PageNavStrip() {
  return (
    <nav
      className="bg-muted/40 flex flex-wrap gap-1 rounded-lg border border-border p-1.5"
      aria-label="Ir a una sección"
    >
      {PAGE_NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="text-muted-foreground hover:bg-background hover:text-foreground inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-[11px] font-medium transition-colors sm:px-2.5 xl:text-xs"
        >
          <ChevronRight className="size-3 shrink-0 opacity-40" aria-hidden />
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function Kpi({
  title,
  value,
  subtitle,
  tone = "default",
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "default" | "positive" | "warning";
}) {
  const border =
    tone === "positive"
      ? "border-emerald-500/25"
      : tone === "warning"
        ? "border-amber-500/25"
        : "border-border";

  return (
    <div
      className={cx(
        "rounded-lg border bg-card p-4 shadow-sm sm:p-5",
        border
      )}
    >
      <p className="text-muted-foreground text-xs font-medium">{title}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-balance sm:text-3xl">
        {value}
      </p>
      {subtitle ? (
        <p className="text-muted-foreground mt-1.5 text-xs leading-snug">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Out({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex items-start justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors sm:gap-4 sm:px-3.5",
        emphasis
          ? "border-primary/25 bg-muted/50"
          : "border-border bg-muted/30"
      )}
    >
      <p
        className={cx(
          "max-w-[75%] text-xs leading-snug font-medium",
          emphasis ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p className="shrink-0 text-right font-mono text-sm font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function FieldSection({
  icon: Icon,
  title,
  description,
  children,
  accent = "primary",
  id,
  compact,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: "primary" | "violet" | "amber" | "emerald";
  id?: string;
  /** Una sola columna, paddings reducidos (panel lateral). */
  compact?: boolean;
}) {
  const ring =
    accent === "violet"
      ? "ring-violet-500/10"
      : accent === "amber"
        ? "ring-amber-500/10"
        : accent === "emerald"
          ? "ring-emerald-500/10"
          : "ring-primary/10";

  const iconT =
    accent === "violet"
      ? "text-violet-600"
      : accent === "amber"
        ? "text-amber-700"
        : accent === "emerald"
          ? "text-emerald-700"
          : "text-primary";

  return (
    <div
      id={id}
      className={cx(
        "relative scroll-mt-24 rounded-lg border border-border bg-card shadow-sm",
        compact ? "p-3 ring-1" : "p-3.5 ring-1 md:p-4",
        ring
      )}
    >
      <div className={cx("relative flex flex-col", compact ? "gap-3" : "gap-4 md:gap-5")}>
        <div className="flex items-start gap-3">
          <span
            className={cx(
              "bg-muted inline-flex shrink-0 items-center justify-center rounded-md border border-border",
              compact ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            <Icon className={cx(compact ? "h-4 w-4" : "h-5 w-5", iconT)} aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5">
            <h3
              className={cx(
                "font-heading font-semibold tracking-tight",
                compact ? "text-sm leading-snug" : "text-base"
              )}
            >
              {title}
            </h3>
            {description ? (
              <p
                className={cx(
                  "text-muted-foreground mt-1 leading-relaxed",
                  compact ? "text-[11px]" : "text-sm"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Modalidad40Calculator() {
  const baseId = useId();
  const [s, setS] = useState<ModalidadInputs>(() => cloneDefaultModalidadInputs());
  const [formKey, setFormKey] = useState(0);

  const derived = useMemo(() => calcDerived(s), [s]);

  const diffTone =
    derived.diferencia === null
      ? ("default" as const)
      : derived.diferencia >= -1e-6
        ? ("positive" as const)
        : ("warning" as const);

  function handleReset() {
    setS(cloneDefaultModalidadInputs());
    setFormKey((k) => k + 1);
  }

  const fk = formKey;

  return (
    <div className="relative min-h-full flex-1">
      <header className="scroll-mt-24 relative border-b border-border bg-background">
        <div className={`${PAGE_WRAP} py-5 sm:py-6 md:py-7`}>
          <div className="flex flex-col gap-5 xl:grid xl:grid-cols-12 xl:items-start xl:gap-8 2xl:gap-10">
            <div className="space-y-3 xl:col-span-5 xl:min-w-0 2xl:col-span-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-muted text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border md:h-11 md:w-11">
                  <Calculator className="h-6 w-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                    Modalidad 40
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      className="rounded-full px-3 py-0.5 text-[11px] font-medium"
                      variant="secondary"
                    >
                      IMSS · Pensión estimada
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed xl:max-w-none">
                Completa cada bloque: los resultados se recalculan al instante. Usa{" "}
                <span className="text-foreground font-medium">Restablecer</span> para volver a los
                valores base del ejemplo.
              </p>
              <div className="flex w-full flex-wrap items-center gap-3 pt-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Activity className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>Tiempo real</span>
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-500/90" aria-hidden />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-10 gap-2 rounded-xl border-dashed px-4 font-semibold shadow-sm sm:h-11 sm:px-5"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Restablecer valores
                </Button>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-3 sm:gap-4 xl:col-span-7 xl:pt-1 2xl:col-span-8">
              <Kpi
                title="Pensión estimada (actual)"
                value={formatCurrency(derived.pensionActual)}
                subtitle="Salario × factor edad"
              />
              <Kpi
                title="Nueva pensión (escenario)"
                value={formatCurrency(derived.nuevaPension)}
                subtitle="Promedio ajustado × factor edad"
              />
              <Kpi
                title="Diferencia"
                value={derived.diferencia === null ? "—" : formatCurrency(derived.diferencia)}
                subtitle="Escenario − actual"
                tone={diffTone}
              />
            </div>
          </div>
        </div>
      </header>

      <main className={`${PAGE_WRAP} py-4 sm:py-6 md:py-8`}>
        <div className="flex flex-col gap-5 sm:gap-6 xl:flex-row xl:items-start xl:gap-6 2xl:gap-8">
          <aside
            className="scrollbar-hide w-full shrink-0 xl:sticky xl:top-20 xl:max-h-[calc(100dvh-4.75rem)] xl:w-[min(30rem,100%)] xl:shrink-0 xl:overflow-y-auto xl:overflow-x-hidden xl:border-border xl:border-r xl:pr-5 2xl:w-[min(36rem,100%)] 2xl:pr-7"
          >
            <Card
              id="captura-datos"
              className="scroll-mt-24 overflow-hidden border-border shadow-sm"
            >
              <CardHeader className="gap-1 border-b border-border bg-muted/40 px-3 py-3 sm:px-4">
                <CardTitle className="text-base md:text-lg">Parámetros</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Coma o punto;{" "}
                  <kbd className="bg-muted rounded border px-1 py-0.5 text-[10px] font-mono">Enter</kbd>{" "}
                  o blur. ▲▼ ajustan el valor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
            <FieldSection
              compact
              id="bloque-semanas"
              icon={CalendarClock}
              title="Cotización y semanas"
              description="Total calculado automáticamente."
              accent="primary"
            >
              <div className="flex flex-col gap-3">
                <NumericField
                  key={`${fk}-sa`}
                  id={`${baseId}-sa`}
                  label="Semanas cotizadas actuales"
                  value={s.semanasActuales}
                  onChange={(v) => setS((p) => ({ ...p, semanasActuales: v }))}
                  variant="integer"
                  unit="sem"
                  stepUpDown={{ step: 1, min: 0 }}
                />
                <NumericField
                  key={`${fk}-sf`}
                  id={`${baseId}-sf`}
                  label="Semanas cotizadas faltantes"
                  value={s.semanasFaltantes}
                  onChange={(v) => setS((p) => ({ ...p, semanasFaltantes: v }))}
                  variant="integer"
                  unit="sem"
                  stepUpDown={{ step: 1, min: 0 }}
                />
                <Out label="Semanas cotizadas (total)" value={formatInteger(derived.semanasTotal)} />
              </div>
            </FieldSection>

            <Separator className="my-1 bg-border/70" />

            <FieldSection
              compact
              id="bloque-salario-uma"
              icon={Landmark}
              title="Salario, UMA y tope"
              description="Montos en pesos; UMA anual."
              accent="violet"
            >
              <div className="flex flex-col gap-3">
                <NumericField
                  key={`${fk}-su`}
                  id={`${baseId}-su`}
                  label="Sueldo promedio mensual"
                  value={s.sueldoPromedioMensual}
                  onChange={(v) => setS((p) => ({ ...p, sueldoPromedioMensual: v }))}
                  variant="currency"
                  maxFractionDigits={2}
                  stepUpDown={{ step: 100, min: 0 }}
                />
                <NumericField
                  key={`${fk}-ed`}
                  id={`${baseId}-ed`}
                  label="Edad de retiro"
                  value={s.edadRetiro}
                  onChange={(v) => setS((p) => ({ ...p, edadRetiro: v }))}
                  variant="integer"
                  unit="años"
                  stepUpDown={{ step: 1, min: 16, max: 100 }}
                />
                <NumericField
                  key={`${fk}-uma`}
                  id={`${baseId}-uma`}
                  label="Valor UMA mensual"
                  value={s.umaMensual}
                  onChange={(v) => setS((p) => ({ ...p, umaMensual: v }))}
                  variant="currency"
                  maxFractionDigits={2}
                  stepUpDown={{ step: 1, min: 0 }}
                />
                <Out
                  label="Veces UMA (salario ÷ UMA)"
                  value={formatNumber(derived.vecesUma, 4)}
                />
                <NumericField
                  key={`${fk}-rango`}
                  id={`${baseId}-rango`}
                  label="Rango UMA"
                  value={s.rangoUma}
                  onChange={(v) => setS((p) => ({ ...p, rangoUma: v }))}
                  variant="integer"
                  stepUpDown={{ step: 1, min: 1 }}
                />
                <NumericField
                  key={`${fk}-pct`}
                  id={`${baseId}-pct`}
                  label="Incremento salarial anual"
                  value={s.pctIncrementoSalarial}
                  onChange={(v) => setS((p) => ({ ...p, pctIncrementoSalarial: v }))}
                  variant="percent"
                  maxFractionDigits={4}
                  hint="Ej. 2,3% como 2,3 en el campo con sufijo %."
                  stepUpDown={{ step: 0.1, min: 0, max: 100 }}
                />
              </div>
            </FieldSection>

            <Separator className="my-1 bg-border/70" />

            <FieldSection
              compact
              id="bloque-factores"
              icon={Sliders}
              title="Factores y ajustes"
              description="Factor IMSS: calibra contra tu Excel."
              accent="amber"
            >
              <div className="flex flex-col gap-3">
                <NumericField
                  key={`${fk}-sxm`}
                  id={`${baseId}-sxm`}
                  label="Semanas excedentes"
                  value={s.semanasExcedentes}
                  onChange={(v) => setS((p) => ({ ...p, semanasExcedentes: v }))}
                  variant="integer"
                  unit="sem"
                  stepUpDown={{ step: 1, min: 0 }}
                />
                <NumericField
                  key={`${fk}-ni`}
                  id={`${baseId}-ni`}
                  label="Número de incrementos"
                  value={s.numIncrementos}
                  onChange={(v) => setS((p) => ({ ...p, numIncrementos: v }))}
                  variant="integer"
                  stepUpDown={{ step: 1, min: 0 }}
                />
                <NumericField
                  key={`${fk}-fi`}
                  id={`${baseId}-fi`}
                  label="Factor incremento"
                  value={s.factorIncremento}
                  onChange={(v) => setS((p) => ({ ...p, factorIncremento: v }))}
                  stepUpDown={{ step: 0.05, min: 0 }}
                />
                <NumericField
                  key={`${fk}-fe`}
                  id={`${baseId}-fe`}
                  label="Factor edad"
                  value={s.factorEdad}
                  onChange={(v) => setS((p) => ({ ...p, factorEdad: v }))}
                  stepUpDown={{ step: 0.05, min: 0, max: 1 }}
                />
                <NumericField
                  key={`${fk}-fimss`}
                  id={`${baseId}-fimss`}
                  label="Factor IMSS vs salario nominal"
                  value={s.factorImssVsNominal}
                  onChange={(v) => setS((p) => ({ ...p, factorImssVsNominal: v }))}
                  hint="Calibra para igualar tu Excel (ej. 33,84 ÷ salario de ejemplo)."
                  stepUpDown={{ step: 0.05, min: 0 }}
                />
                <NumericField
                  key={`${fk}-anhist`}
                  id={`${baseId}-anhist`}
                  label="Años con sueldo promedio"
                  value={s.aniosConSueldoPromedio}
                  onChange={(v) => setS((p) => ({ ...p, aniosConSueldoPromedio: v }))}
                  variant="integer"
                  unit="años"
                  stepUpDown={{ step: 1, min: 0 }}
                />
              </div>
            </FieldSection>
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 flex-1 space-y-5 sm:space-y-6 md:space-y-8">
            <PageNavStrip />

        <div id="resultados-escenario" className="scroll-mt-28 grid gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2 lg:gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Resultado</CardTitle>
              <CardDescription>Situación actual sin el promedio combinado del proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Out
                emphasis
                label="Pensión estimada mensual"
                value={formatCurrency(derived.pensionActual)}
              />
              <Out
                label="Incremento salarial (referencia)"
                value={formatPercentFromRate(s.pctIncrementoSalarial)}
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Escenario Modalidad 40</CardTitle>
              <CardDescription>Comparativo frente al escenario base.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Out
                label="Salario promedio últimas 250 semanas (prox.)"
                value={formatCurrency(derived.salarioPromedio250)}
              />
              <Out emphasis label="Nueva pensión" value={formatCurrency(derived.nuevaPension)} />
              <Out label="Diferencia vs. pensión actual" value={formatCurrency(derived.diferencia)} />
            </CardContent>
          </Card>
        </div>

        <Card
          id="plan-mod40"
          className="scroll-mt-28 overflow-hidden border-border shadow-sm"
        >
          <CardHeader className="gap-1 border-b border-border bg-muted/40 pb-4 sm:pb-5">
            <div className="flex items-center gap-2">
              <span className="bg-muted text-amber-800 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border sm:h-10 sm:w-10">
                <TrendingUp className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-lg">Ahorro Modalidad 40 / Plan</CardTitle>
                <CardDescription>Plazos y montos del proyecto.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 md:pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <NumericField
                key={`${fk}-eir`}
                id={`${baseId}-eir`}
                label="Edad de retiro (plan)"
                value={s.edadRetiro}
                onChange={(v) => setS((p) => ({ ...p, edadRetiro: v }))}
                variant="integer"
                unit="años"
                stepUpDown={{ step: 1, min: 16, max: 100 }}
              />
              <NumericField
                key={`${fk}-eim`}
                id={`${baseId}-eim`}
                label="Edad inicio Modalidad 40"
                value={s.edadInicioMod40}
                onChange={(v) => setS((p) => ({ ...p, edadInicioMod40: v }))}
                variant="integer"
                unit="años"
                stepUpDown={{ step: 1, min: 16, max: 100 }}
              />
              <Out label="Años de Modalidad 40" value={formatNumber(derived.aniosMod40, 0)} />
              <NumericField
                key={`${fk}-pap`}
                id={`${baseId}-pap`}
                label="Pago anual"
                value={s.pagoAnualPlan}
                onChange={(v) => setS((p) => ({ ...p, pagoAnualPlan: v }))}
                variant="currency"
                maxFractionDigits={2}
              />
              <NumericField
                key={`${fk}-udis`}
                id={`${baseId}-udis`}
                label="UDIs"
                value={s.udisPlan}
                onChange={(v) => setS((p) => ({ ...p, udisPlan: v }))}
              />
              <NumericField
                key={`${fk}-ptp`}
                id={`${baseId}-ptp`}
                label="Pago total del proyecto"
                value={s.pagoTotalProyecto}
                onChange={(v) => setS((p) => ({ ...p, pagoTotalProyecto: v }))}
                variant="currency"
                maxFractionDigits={2}
              />
              <NumericField
                key={`${fk}-ptu`}
                id={`${baseId}-ptu`}
                label="Pago total en UDIs"
                value={s.pagoTotalUdis}
                onChange={(v) => setS((p) => ({ ...p, pagoTotalUdis: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <div id="finanzas-proyeccion" className="scroll-mt-28 grid gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2 lg:gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="gap-1 pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-muted text-emerald-800 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border sm:h-10 sm:w-10">
                  <PiggyBank className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <CardTitle className="text-lg">Variables financieras</CardTitle>
                  <CardDescription>IMSS, UDIs y pagos.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <NumericField
                  key={`${fk}-pimss`}
                  id={`${baseId}-pimss`}
                  label="Pago al IMSS"
                  value={s.pagoImss}
                  onChange={(v) => setS((p) => ({ ...p, pagoImss: v }))}
                  variant="currency"
                  maxFractionDigits={2}
                />
                <NumericField
                  key={`${fk}-c40`}
                  id={`${baseId}-c40`}
                  label="Cantidad de años Mod. 40"
                  value={s.cantidadAniosMod40}
                  onChange={(v) => setS((p) => ({ ...p, cantidadAniosMod40: v }))}
                  variant="integer"
                />
                <NumericField
                  key={`${fk}-paf`}
                  id={`${baseId}-paf`}
                  label="Pago anual"
                  value={s.pagoAnualFin}
                  onChange={(v) => setS((p) => ({ ...p, pagoAnualFin: v }))}
                  variant="currency"
                  maxFractionDigits={2}
                />
                <NumericField
                  key={`${fk}-pm40`}
                  id={`${baseId}-pm40`}
                  label="Pago Modalidad 40"
                  value={s.pagoModalidad40}
                  onChange={(v) => setS((p) => ({ ...p, pagoModalidad40: v }))}
                  variant="currency"
                  maxFractionDigits={2}
                />
                <NumericField
                  key={`${fk}-vudi`}
                  id={`${baseId}-vudi`}
                  label="Valor UDI"
                  value={s.valorUdi}
                  onChange={(v) => setS((p) => ({ ...p, valorUdi: v }))}
                />
                <NumericField
                  key={`${fk}-udiR`}
                  id={`${baseId}-udiR`}
                  label="UDIs de resguardo al año"
                  value={s.udisResguardoAnio}
                  onChange={(v) => setS((p) => ({ ...p, udisResguardoAnio: v }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Proyección final</CardTitle>
              <CardDescription>Resumen combinado con la tabla de 250 semanas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Out
                label="Salario IMSS × años con sueldo promedio"
                value={formatCurrency(derived.totalSalarioHistorial)}
              />
              <Out
                label="Salario incrementado por años Mod. 40"
                value={
                  derived.salarioIncrementadoMod40 === null
                    ? "—"
                    : formatCurrency(derived.salarioIncrementadoMod40)
                }
              />
              <Separator />
              <Out label="Suma de ambos salarios" value={formatCurrency(derived.sumaAmbosSalarios)} />
              <Out
                label="Salario promedio al IMSS combinado"
                value={formatCurrency(derived.salarioPromedioImssCombinado)}
              />
              <Out label="Promedio salario (ajuste)" value={formatCurrency(derived.promedioSalario)} />
              <Out label="Edad de retiro" value={formatInteger(s.edadRetiro)} />
              <Out
                emphasis
                label="Pensión con proyecto y salario"
                value={formatCurrency(derived.pensionConProyecto)}
              />
            </CardContent>
          </Card>
        </div>

        <Card
          id="tabla-250"
          className="scroll-mt-28 overflow-hidden border-border shadow-sm"
        >
          <CardHeader className="gap-1 border-b border-border bg-muted/40 pb-4 sm:pb-5">
            <div className="flex items-center gap-2">
              <span className="bg-muted text-primary inline-flex h-9 w-9 items-center justify-center rounded-md border border-border sm:h-10 sm:w-10">
                <TableProperties className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-lg">250 semanas cotizadas</CardTitle>
                <CardDescription>Desglose enlazado a los valores actuales.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 md:pt-6">
            <div className="overflow-x-auto rounded-lg border border-border bg-muted/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 bg-muted/45 hover:bg-muted/45">
                    <TableHead className="font-semibold">Concepto</TableHead>
                    <TableHead className="text-right font-semibold">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-border/50 odd:bg-muted/20 even:bg-transparent">
                    <TableCell className="py-3 pr-4">Salario promedio mensual</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(s.sueldoPromedioMensual)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/50 odd:bg-muted/20 even:bg-transparent">
                    <TableCell className="py-3 pr-4">Salario promedio anual</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(derived.salarioPromedioAnual)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/50 odd:bg-muted/20 even:bg-transparent">
                    <TableCell className="py-3 pr-4">Años con sueldo promedio</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                      {formatInteger(s.aniosConSueldoPromedio)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border/50 odd:bg-muted/20 even:bg-transparent">
                    <TableCell className="py-3 pr-4">Años con Mod. 40</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                      {formatNumber(derived.aniosMod40, 0)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="odd:bg-muted/20">
                    <TableCell className="py-3 pr-4">Sueldo promedio pagado al IMSS</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(derived.sueldoPagadoImssMensual)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
