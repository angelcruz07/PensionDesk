/**
 * Fórmulas de la calculadora Modalidad 40 (vista previa en tiempo real).
 * Toda la lógica numérica vive aquí; la UI solo consume `calcDerived`.
 */

const EPS = 1e-9;

export type ModalidadInputs = {
  semanasActuales: number;
  semanasFaltantes: number;
  sueldoPromedioMensual: number;
  edadRetiro: number;
  umaMensual: number;
  rangoUma: number;
  pctIncrementoSalarial: number;
  semanasExcedentes: number;
  numIncrementos: number;
  factorIncremento: number;
  factorEdad: number;
  edadInicioMod40: number;
  pagoAnualPlan: number;
  udisPlan: number;
  pagoTotalProyecto: number;
  pagoTotalUdis: number;
  pagoImss: number;
  cantidadAniosMod40: number;
  pagoAnualFin: number;
  pagoModalidad40: number;
  valorUdi: number;
  udisResguardoAnio: number;
  /** Peso histórico respecto al salario nominal (calibra hacia el ejemplo Excel). */
  factorImssVsNominal: number;
  aniosConSueldoPromedio: number;
};

export type ModalidadDerived = {
  semanasTotal: number;
  vecesUma: number;
  salarioPromedioAnual: number;
  sueldoPagadoImssMensual: number;
  aniosMod40: number;
  salarioPromedio250: number | null;
  pensionActual: number;
  nuevaPension: number | null;
  diferencia: number | null;
  salarioPromedioImssCombinado: number | null;
  promedioSalario: number | null;
  pensionConProyecto: number | null;
  totalSalarioHistorial: number;
  salarioIncrementadoMod40: number | null;
  sumaAmbosSalarios: number;
  denomCombinado: number;
};

export function divisionSegura(numerador: number, denominador: number): number | null {
  if (Math.abs(denominador) < EPS) return null;
  return numerador / denominador;
}

/** Semanas totales = actuales + faltantes. */
export function semanasCotizadasTotales(semanasActuales: number, semanasFaltantes: number): number {
  return semanasActuales + semanasFaltantes;
}

/** Veces UMA = salario mensual ÷ UMA mensual (0 si no hay UMA). */
export function vecesUma(sueldoMensual: number, umaMensual: number): number {
  return umaMensual > 0 ? sueldoMensual / umaMensual : 0;
}

/** Salario promedio anual a partir del mensual. */
export function salarioPromedioAnualDesdeMensual(sueldoMensual: number): number {
  return sueldoMensual * 12;
}

/** Estimación del sueldo declarado al IMSS vía factor sobre el nominal. */
export function sueldoImssMensualDesdeNominal(
  sueldoNominalMensual: number,
  factorImssVsNominal: number
): number {
  return sueldoNominalMensual * factorImssVsNominal;
}

/** Años en Modalidad 40 = edad de retiro − edad de inicio en el régimen. */
export function aniosModalidad40(edadRetiro: number, edadInicioMod40: number): number {
  return edadRetiro - edadInicioMod40;
}

/** Parte del historial: IMSS mensual × años con sueldo promedio. */
export function totalSalarioHistorialImss(
  sueldoPagadoImssMensual: number,
  aniosConSueldoPromedio: number
): number {
  return sueldoPagadoImssMensual * aniosConSueldoPromedio;
}

/** Incremento acumulado en el periodo Mod. 40 (simplificado del Excel). */
export function salarioIncrementadoPorMod40(
  factorIncremento: number,
  sueldoMensual: number,
  aniosMod40: number
): number | null {
  if (aniosMod40 <= EPS) return null;
  return factorIncremento * sueldoMensual * aniosMod40;
}

/** Salario promedio al IMSS “combinado” (ponderado por años). */
export function salarioPromedioImssCombinado(
  totalHistorial: number,
  incrementoMod40: number | null,
  aniosConSueldoPromedio: number,
  aniosMod40: number
): number | null {
  const suma = totalHistorial + (incrementoMod40 ?? 0);
  const denom = aniosConSueldoPromedio + aniosMod40;
  return divisionSegura(suma, denom);
}

/**
 * Ajuste del “promedio salario” respecto al nominal, usando la ración IMSS/nominal.
 */
export function promedioSalarioAjustado(
  salarioPromedioImssCombinado: number | null,
  sueldoNominalMensual: number,
  sueldoPagadoImssMensual: number
): number | null {
  if (sueldoPagadoImssMensual <= EPS || salarioPromedioImssCombinado === null) return null;
  return (salarioPromedioImssCombinado * sueldoNominalMensual) / sueldoPagadoImssMensual;
}

/** Pensión mensual estimada = base salarial × factor de edad. */
export function pensionMensualPorFactor(salarioBase: number, factorEdad: number): number {
  return salarioBase * factorEdad;
}

export function calcDerived(input: ModalidadInputs): ModalidadDerived {
  const semanasTotal = semanasCotizadasTotales(input.semanasActuales, input.semanasFaltantes);
  const sueldo = input.sueldoPromedioMensual;
  const uma = input.umaMensual;

  const vecesU = vecesUma(sueldo, uma);
  const salarioPromedioAnual = salarioPromedioAnualDesdeMensual(sueldo);
  const sueldoPagadoImssMensual = sueldoImssMensualDesdeNominal(
    sueldo,
    input.factorImssVsNominal
  );

  const aniosMod40 = aniosModalidad40(input.edadRetiro, input.edadInicioMod40);
  const totalSalarioHistorial = totalSalarioHistorialImss(
    sueldoPagadoImssMensual,
    input.aniosConSueldoPromedio
  );

  const salarioIncrementadoMod40 = salarioIncrementadoPorMod40(
    input.factorIncremento,
    sueldo,
    aniosMod40
  );

  const sumaAmbosSalarios = totalSalarioHistorial + (salarioIncrementadoMod40 ?? 0);
  const denomCombinado = input.aniosConSueldoPromedio + aniosMod40;

  const salarioPromedioImssCombinadoVal = salarioPromedioImssCombinado(
    totalSalarioHistorial,
    salarioIncrementadoMod40,
    input.aniosConSueldoPromedio,
    aniosMod40
  );

  const promedioSalario = promedioSalarioAjustado(
    salarioPromedioImssCombinadoVal,
    sueldo,
    sueldoPagadoImssMensual
  );

  const pensionActual = pensionMensualPorFactor(sueldo, input.factorEdad);
  const nuevaPension =
    promedioSalario !== null
      ? pensionMensualPorFactor(promedioSalario, input.factorEdad)
      : null;

  const salarioPromedio250 =
    salarioPromedioImssCombinadoVal !== null ? salarioPromedioImssCombinadoVal : null;

  const diferencia =
    nuevaPension !== null ? nuevaPension - pensionActual : null;

  const pensionConProyecto = nuevaPension;

  return {
    semanasTotal,
    vecesUma: vecesU,
    salarioPromedioAnual,
    sueldoPagadoImssMensual,
    aniosMod40,
    salarioPromedio250,
    pensionActual,
    nuevaPension,
    diferencia,
    salarioPromedioImssCombinado: salarioPromedioImssCombinadoVal,
    promedioSalario,
    pensionConProyecto,
    totalSalarioHistorial,
    salarioIncrementadoMod40,
    sumaAmbosSalarios,
    denomCombinado,
  };
}
