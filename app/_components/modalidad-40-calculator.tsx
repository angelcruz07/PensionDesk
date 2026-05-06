"use client";

import { useEffect, useMemo, useId, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MAX_ANIOS_MODALIDAD_40,
  MAX_EDAD_INICIO_MODALIDAD_40,
  MIN_ANIOS_MODALIDAD_40,
  SEMANAS_POR_ANIO,
} from "@/lib/modalidad-40/formulas";
import { cloneDefaultModalidadInputs } from "@/lib/modalidad-40/defaults";
import type { ModalidadInputs } from "@/lib/modalidad-40/formulas";
import { buildPromedioActuarialVista } from "@/lib/modalidad-40/promedio-actuarial-vista";
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
  FileDown,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Out } from "./Out";

/** Ancho fluido; paddings más ajustados en móvil (patrón dashboard shadcn). */
const PAGE_WRAP =
  "mx-auto w-full max-w-screen-2xl px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12";

const EDADES_RETIRO = [60, 61, 62, 63, 64, 65] as const;

const EDADES_INICIO_MOD40 = [
  55, 56, 57, 58, 59, 60, 61, 62, 63, 64,
] as const;
function EdadRetiroSelector({
  id,
  label,
  value,
  onChange,
  showHint = true,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  showHint?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label
        id={`${id}-label`}
        className="text-muted-foreground block w-full text-xs font-medium leading-tight break-words"
      >
        {label}
      </Label>
      <div
        id={`${id}-group`}
        className="flex flex-wrap gap-1"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
      >
        {EDADES_RETIRO.map((edad) => (
          <Button
            key={edad}
            type="button"
            variant={value === edad ? "default" : "outline"}
            size="sm"
            className="h-8 min-h-8 min-w-9 shrink-0 px-2.5 text-xs"
            onClick={() => onChange(edad)}
            aria-checked={value === edad}
            role="radio"
            aria-label={`${edad} años`}
          >
            {edad}
          </Button>
        ))}
      </div>
      {showHint ? (
        <p className="text-muted-foreground text-[10px] leading-snug">
          Solo edades de 60 a 65 años.
        </p>
      ) : null}
    </div>
  );
}

function EdadInicioMod40Selector({
  id,
  label,
  edadRetiro,
  value,
  onChange,
}: {
  id: string;
  label: string;
  edadRetiro: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const minAllowed = Math.max(55, edadRetiro - MAX_ANIOS_MODALIDAD_40);
  const maxAllowed = Math.min(
    MAX_EDAD_INICIO_MODALIDAD_40,
    edadRetiro - MIN_ANIOS_MODALIDAD_40,
  );
  const opciones = EDADES_INICIO_MOD40.filter(
    (e) => e >= minAllowed && e <= maxAllowed
  );

  return (
    <div className="space-y-1">
      <Label
        id={`${id}-label`}
        className="text-muted-foreground block w-full text-xs font-medium leading-tight break-words"
      >
        {label}
      </Label>
      <div
        id={`${id}-group`}
        className="flex flex-wrap gap-1"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
      >
        {opciones.map((edad) => (
          <Button
            key={edad}
            type="button"
            variant={value === edad ? "default" : "outline"}
            size="sm"
            className="h-8 min-h-8 min-w-9 shrink-0 px-2.5 text-xs"
            onClick={() => onChange(edad)}
            aria-checked={value === edad}
            role="radio"
            aria-label={`${edad} años`}
          >
            {edad}
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground text-[10px] leading-snug">
        Entre {minAllowed} y {maxAllowed} años según retiro (1 a {MAX_ANIOS_MODALIDAD_40} años en
        Modalidad 40; inicio hasta {MAX_EDAD_INICIO_MODALIDAD_40} años).
      </p>
    </div>
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
        "min-w-0 rounded-lg border bg-card p-4 shadow-sm sm:p-5",
        border
      )}
    >
      <p className="text-muted-foreground text-xs font-medium leading-snug">{title}</p>
      {/* Cantidades: una sola línea; si no caben, scroll horizontal suave (evita partir dígitos). */}
      <div className="mt-2 min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
        <p className="inline-block min-w-min whitespace-nowrap font-mono text-lg font-semibold tabular-nums tracking-tight sm:text-xl md:text-2xl">
          {value}
        </p>
      </div>
      {subtitle ? (
        <p className="text-muted-foreground mt-1.5 text-xs leading-snug">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Modalidad40Calculator() {
  const baseId = useId();
  const [s, setS] = useState<ModalidadInputs>(() => cloneDefaultModalidadInputs());
  const [formKey, setFormKey] = useState(0);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (s.edadRetiro < 60 || s.edadRetiro > 65) {
      setS((p) => ({
        ...p,
        edadRetiro: Math.min(65, Math.max(60, p.edadRetiro)),
      }));
    }
  }, [s.edadRetiro]);

  /** 55–64, inicio ≤ retiro−1 (≥1 año) e inicio ≥ retiro−5 (≤5 años). */
  useEffect(() => {
    setS((p) => {
      const minEdad = 55;
      const maxPorRetiro = Math.min(
        MAX_EDAD_INICIO_MODALIDAD_40,
        p.edadRetiro - MIN_ANIOS_MODALIDAD_40,
      );
      const minPorAniosPermitidos = p.edadRetiro - MAX_ANIOS_MODALIDAD_40;
      const minEfectiva = Math.max(minEdad, Math.round(minPorAniosPermitidos));
      const clamped = Math.min(
        maxPorRetiro,
        Math.max(minEfectiva, Math.round(Number(p.edadInicioMod40)))
      );
      if (clamped === p.edadInicioMod40) return p;
      return { ...p, edadInicioMod40: clamped };
    });
  }, [s.edadRetiro, s.edadInicioMod40]);

  /** Semanas faltantes automáticas: del año en curso hasta la edad de retiro (50 semanas por año). */
  useEffect(() => {
    setS((p) => {
      const edadActual = Math.max(0, Number(p.edadActual));
      const edadRetiro = Math.max(0, Number(p.edadRetiro));
      const semanasActuales = Math.max(0, Math.round(Number(p.semanasActuales)));
      const semanasDisponibles = Math.max(0, Math.round((edadRetiro - edadActual) * SEMANAS_POR_ANIO));
      const faltantes = Math.max(0, semanasDisponibles - semanasActuales);
      if (faltantes === p.semanasFaltantes) return p;
      return { ...p, semanasFaltantes: faltantes };
    });
  }, [s.edadActual, s.edadRetiro, s.semanasActuales, s.semanasFaltantes]);

  const vista = useMemo(() => buildPromedioActuarialVista(s), [s]);
  const { derived } = vista;

  const diffTone =
    derived.diferencia >= -1e-6 ? ("positive" as const) : ("warning" as const);

  function handleReset() {
    setS(cloneDefaultModalidadInputs());
    setFormKey((k) => k + 1);
  }

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      const res = await fetch("/api/reportes/modalidad-40/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        window.alert(
          res.status === 401 || res.status === 403
            ? "No tienes acceso para descargar el reporte. Revisa tu plan."
            : "No se pudo generar el PDF. Intenta de nuevo más tarde."
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte-modalidad-40-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
    } finally {
      setPdfBusy(false);
    }
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
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="h-10 gap-2 rounded-xl px-4 font-semibold shadow-sm sm:h-11 sm:px-5"
                  onClick={() => void handleDownloadPdf()}
                  disabled={pdfBusy}
                >
                  {pdfBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <FileDown className="h-4 w-4" aria-hidden />
                  )}
                  {pdfBusy ? "Generando PDF…" : "Descargar PDF"}
                </Button>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 xl:col-span-7 xl:pt-1 2xl:col-span-8">
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
                value={formatCurrency(derived.diferencia)}
                subtitle="Escenario − actual"
                tone={diffTone}
              />
            </div>
          </div>
        </div>
      </header>

      <main className={`${PAGE_WRAP} py-4 sm:py-6 md:py-8`}>
        <div className="space-y-5 sm:space-y-6 md:space-y-8">
          <section id="captura-datos" className="space-y-3 sm:space-y-4">
            <Card
              className="scroll-mt-24 overflow-hidden border-border shadow-sm"
            >
              <CardHeader className="gap-0.5 border-b border-border bg-muted/40 px-3 py-2.5 sm:px-4">
                <CardTitle className="text-base md:text-lg">Parámetros</CardTitle>
                <CardDescription className="text-[11px] leading-snug">
                  Coma o punto;{" "}
                  <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">
                    Enter
                  </kbd>{" "}
                  o blur; ▲▼ ajustan.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 py-3 sm:px-4">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-12 xl:gap-x-3 xl:gap-y-2">
                    <NumericField
                      key={`${fk}-sa`}
                      compact
                      className="xl:col-span-2"
                      id={`${baseId}-sa`}
                      label="Semanas cotizadas actuales"
                      value={s.semanasActuales}
                      onChange={(v) => setS((p) => ({ ...p, semanasActuales: v }))}
                      variant="integer"
                      unit="sem"
                      stepUpDown={{ step: 1, min: 0 }}
                    />
                    <NumericField
                      key={`${fk}-su`}
                      compact
                      className="xl:col-span-4"
                      id={`${baseId}-su`}
                      label="Sueldo promedio mensual"
                      value={s.sueldoPromedioMensual}
                      onChange={(v) => setS((p) => ({ ...p, sueldoPromedioMensual: v }))}
                      variant="currency"
                      maxFractionDigits={2}
                      stepUpDown={{ step: 100, min: 0 }}
                    />
                    <NumericField
                      key={`${fk}-ea`}
                      compact
                      className="xl:col-span-2"
                      id={`${baseId}-ea`}
                      label="Edad actual"
                      value={s.edadActual}
                      onChange={(v) => setS((p) => ({ ...p, edadActual: v }))}
                      variant="integer"
                      unit="años"
                      hint="Años cumplidos hoy."
                      stepUpDown={{ step: 1, min: 18, max: 100 }}
                    />
                    <div className="md:col-span-2 xl:col-span-4">
                      <EdadRetiroSelector
                        id={`${baseId}-ed`}
                        label="Edad de retiro"
                        value={s.edadRetiro}
                        onChange={(v) => setS((p) => ({ ...p, edadRetiro: v }))}
                      />
                    </div>
                  </div>

                  <div id="plan-mod40">
                    <p className="text-muted-foreground rounded-md border border-dashed border-border/70 bg-muted/30 px-2.5 py-1.5 text-[11px] leading-snug">
                      Parámetros del escenario Modalidad 40
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:gap-3 xl:grid-cols-12 xl:gap-x-3 xl:gap-y-2">
                    <div className="xl:col-span-4">
                      <EdadInicioMod40Selector
                        id={`${baseId}-eim`}
                        label="Edad inicio Modalidad 40"
                        edadRetiro={s.edadRetiro}
                        value={s.edadInicioMod40}
                        onChange={(v) =>
                          setS((p) => ({ ...p, edadInicioMod40: v }))
                        }
                      />
                    </div>
                    <NumericField
                      key={`${fk}-anhist`}
                      compact
                      className="xl:col-span-2"
                      id={`${baseId}-anhist`}
                      label="Años con sueldo promedio"
                      value={s.aniosConSueldoPromedio}
                      onChange={(v) => setS((p) => ({ ...p, aniosConSueldoPromedio: v }))}
                      variant="integer"
                      unit="años"
                      stepUpDown={{ step: 1, min: 0 }}
                    />
                    <NumericField
                      key={`${fk}-s250`}
                      compact
                      className="xl:col-span-6"
                      id={`${baseId}-s250`}
                      label="Salario prom. 250 sem. IMSS (mensual)"
                      value={s.salarioPromedio250ImssCaptura}
                      onChange={(v) =>
                        setS((p) => ({ ...p, salarioPromedio250ImssCaptura: v }))
                      }
                      variant="currency"
                      maxFractionDigits={2}
                      hint="Opcional. 0 = solo modelo."
                      stepUpDown={{ step: 100, min: 0 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

        <section id="resultados-escenario" className="scroll-mt-28 space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Calculadora de promedio actuarial ajustado
            </h2>
            <p className="text-muted-foreground text-sm">Resumen automático basado en los parámetros capturados.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2 lg:gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Escenario normal sin  una estrategia financiera</CardTitle>
              <CardDescription>Situación actual sin el promedio combinado del proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Out
                label="Salario promedio mensual"
                value={formatCurrency(s.sueldoPromedioMensual)}
              />
              <Out
                label="Promedio salario anual"
                value={formatCurrency(derived.salarioPromedioAnual)}
              />
              <Out
                label="Años en salario normal"
                value={formatInteger(vista.aniosSalarioNormal)}
              />
              <Out
                label="Pago mensual al IMSS con salario normal"
                value={formatCurrency(vista.pagoMensualImssSalarioNormal)}
              />
              <Out
                label="Pago total anual al IMSS con salario normal"
                value={formatCurrency(vista.pagoAnualImssSalarioNormal)}
              />
              <Out
                label="Pago total de los años con salario normal"
                value={formatCurrency(vista.pagoTotalAniosSalarioNormal)}
              />
              <Out label="Edad de retiro" value={formatInteger(s.edadRetiro)} />
              <Out
                emphasis
                label="Pensión estimada mensual"
                value={formatCurrency(derived.pensionActual)}
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Escenario con una estrategia financiera para modalidad 40</CardTitle>
              <CardDescription>Comparativo frente al escenario base.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Out
                label="Salario promedio mensual"
                value={formatCurrency(vista.salarioPromedioMensualMod40)}
              />
              <Out
                label="Promedio salario anual"
                value={formatCurrency(vista.salarioPromedioAnualMod40)}
              />
              <Out
                label="Años en Modalidad 40"
                value={formatInteger(derived.aniosMod40)}
              />
              <Out
                label="Pago mensual al IMSS con Modalidad 40"
                value={formatCurrency(vista.pagoMensualImssMod40)}
              />
              <Out
                label="Pago anual al IMSS con Modalidad 40"
                value={formatCurrency(vista.pagoAnualImssMod40)}
              />
              <Out
                label="Pago total de los años en Modalidad 40"
                value={formatCurrency(vista.pagoTotalAniosMod40)}
              />
              <Out
                label="Suma de ambos salarios (años normal + Modalidad 40)"
                value={formatCurrency(vista.sumaAmbosSalarios)}
              />
              <Out
                label="Suma total pagada al IMSS (normal + Modalidad 40)"
                value={formatCurrency(vista.sumaTotalImssPagadoNormalYMod40)}
              />
              <Out
                label="Salario promedio combinado"
                value={formatCurrency(vista.salarioPromedioCombinado)}
              />
              <Out
                label="Porcentaje de pensión"
                value={`${formatInteger(vista.porcentajePensionRedondeado)}%`}
              />
              <Out
                label="Promedio salario"
                value={formatCurrency(vista.promedioSalarioPaneles)}
              />
              <Out
                label="Pensión con proyecto y salario"
                value={formatCurrency(vista.pensionConProyectoYSalario)}
              />
              <Out emphasis label="Nueva pensión con modalidad 40" value={formatCurrency(derived.nuevaPension)} />
              <Out
                label="Diferencia vs. pensión actual"
                value={formatCurrency(derived.diferencia)}
              />
            </CardContent>
          </Card>

          </div>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                Salidas de la calculadora (promedio actuarial ajustado)
              </CardTitle>
              <CardDescription>Valores derivados para referencia rápida.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <Out label="Total de semanas cotizadas" value={formatInteger(derived.semanasTotal)} />
              <Out
                label="Semanas cotizadas faltantes"
                value={formatInteger(derived.semanasFaltantesCalculadas)}
              />
              <Out label="Semanas excedentes" value={formatInteger(derived.semanasExcedentes)} />
              <Out label="Valor UMA mensual" value={formatCurrency(s.umaMensual)} />
              <Out label="Veces UMA" value={formatNumber(derived.vecesUma, 1)} />
              <Out label="Rango UMA" value={derived.rangoUma} />
              <Out label="Incremento salarial" value={formatPercentFromRate(derived.pctIncrementoSalarial)} />
              <Out label="Número de incrementos" value={formatInteger(derived.numIncrementos)} />
              <Out label="Factor incremento" value={formatNumber(derived.factorIncremento, 2)} />
              <Out label="Factor edad" value={formatNumber(derived.factorEdad, 2)} />
              <Out label="Años en Modalidad 40" value={formatInteger(derived.aniosMod40)} />          
              <Out
                label="Pago Modalidad 40"
                value={formatCurrency(derived.pagoModalidad40Total)}
              />
              <Out label="Valor UDI" value={formatNumber(s.valorUdi, 2)} />
              <Out
                label="UDIs de resguardo al año"
                value={formatNumber(derived.udis, 2)}
              />

            </CardContent>
          </Card>
        </section>
        </div>
      </main>
    </div>
  );
}
