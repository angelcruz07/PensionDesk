/**
 * Fórmulas de la calculadora Modalidad 40 (vista previa en tiempo real).
 * Toda la lógica numérica vive aquí; la UI solo consume `calcDerived`.
 */

const EPS = 1e-9;

export type ModalidadInputs = {
  semanasActuales: number;
  semanasFaltantes: number;
  sueldoPromedioMensual: number;
  /** Edad del trabajador al momento de la simulación (años). */
  edadActual: number;
  edadRetiro: number;
  umaMensual: number;
  edadInicioMod40: number;
  pagoAnualPlan: number;
  cantidadAniosMod40: number;
  valorUdi: number;
  /** Peso histórico respecto al salario nominal (calibra hacia el ejemplo Excel). */
  factorImssVsNominal: number;
  aniosConSueldoPromedio: number;
  /**
   * Salario promedio mensual de las últimas 250 semanas según el IMSS (opcional).
   * Si es mayor que 0, sustituye al salario combinado calculado para pensión y escenario Mod. 40.
   */
  salarioPromedio250ImssCaptura: number;
};

export type ModalidadDerived = {
  semanasFaltantesCalculadas: number;
  semanasTotal: number;
  semanasExcedentes: number;
  numIncrementos: number;
  vecesUma: number;
  rangoUma: "1" | "2" | "3" | "4" | "5" | "6+";
  pctIncrementoSalarial: number;
  factorEdad: number;
  factorIncremento: number;
  salarioPromedioAnual: number;
  sueldoPagadoImssMensual: number;
  aniosMod40: number;
  salarioPromedio250: number | null;
  pagoImss: number | null;
  pagoAnualNormal: number;
  /** UDIs = pago anual normal ÷ valor UDI. */
  udis: number | null;
  /** UDIs (anual) × años en Modalidad 40 (`cantidadAniosMod40`). */
  pagoTotalUdisModalidad: number | null;
  pagoModalidad40Total: number;
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
  /** true si se usa `salarioPromedio250ImssCaptura` en lugar del promedio combinado del modelo. */
  usaSalario250ImssManual: boolean;
};

export function divisionSegura(numerador: number, denominador: number): number | null {
  if (Math.abs(denominador) < EPS) return null;
  return numerador / denominador;
}

/** Semanas cotizadas proyectadas = actuales + faltantes. */
export function semanasCotizadasTotales(semanasActuales: number, semanasFaltantes: number): number {
  return semanasActuales + semanasFaltantes;
}

/** Semanas excedentes según Excel: MAX(B4 - 500, 0), donde B4 = semanas cotizadas. */
export function semanasExcedentesDesdeCotizadas(
  semanasCotizadas: number,
  minimoSemanas: number = 500
): number {
  return Math.max(0, semanasCotizadas - minimoSemanas);
}

/** Número de incrementos según Excel: ENTERO(B11 / 52), donde B11 = semanas excedentes. */
export function numeroIncrementosDesdeSemanasExcedentes(semanasExcedentes: number): number {
  if (!Number.isFinite(semanasExcedentes) || semanasExcedentes <= 0) return 0;
  return Math.floor(semanasExcedentes / 52);
}

/** Veces UMA = salario mensual ÷ UMA mensual (0 si no hay UMA). */
export function vecesUma(sueldoMensual: number, umaMensual: number): number {
  return umaMensual > 0 ? sueldoMensual / umaMensual : 0;
}

/** Rango UMA */
export function rangoUmaDesdeVecesUma(valorVecesUma: number): "1" | "2" | "3" | "4" | "5" | "6+" {
  if (!Number.isFinite(valorVecesUma) || valorVecesUma <= 1) return "1";
  if (valorVecesUma <= 2) return "2";
  if (valorVecesUma <= 3) return "3";
  if (valorVecesUma <= 4) return "4";
  if (valorVecesUma <= 5) return "5";
  return "6+";
}

/** Incremento salarial anual por tramos según B8 (Veces UMA). */
export function incrementoSalarialDesdeVecesUma(valorVecesUma: number): number {
  if (!Number.isFinite(valorVecesUma) || valorVecesUma <= 1) return 0.023;
  if (valorVecesUma <= 2) return 0.021;
  if (valorVecesUma <= 3) return 0.019;
  if (valorVecesUma <= 4) return 0.017;
  if (valorVecesUma <= 5) return 0.015;
  return 0.013;
}

/** Calculo factor edad */
export function factorEdadDesdeEdadRetiro(edadRetiro: number): number {
  if (edadRetiro === 60) return 0.75;
  if (edadRetiro === 61) return 0.8;
  if (edadRetiro === 62) return 0.85;
  if (edadRetiro === 63) return 0.9;
  if (edadRetiro === 64) return 0.95;
  if (edadRetiro >= 65) return 1;
  return 0;
}

/** Factor incremento según Excel: 1 + (B12 * B10). */
export function factorIncrementoDesdeValores(
  numIncrementos: number,
  pctIncrementoSalarial: number
): number {
  return 1 + numIncrementos * pctIncrementoSalarial;
}

/** Pago al IMSS según Excel: B18 * 18.8%, donde B18 = salario últimas 250 semanas. */
export function pagoImssDesdeSalario250(salarioPromedio250: number | null): number | null {
  if (salarioPromedio250 === null) return null;
  return salarioPromedio250 * 0.188;
}

/** Pago anual normal = pago al IMSS × 12. */
export function pagoAnualDesdePagoImss(pagoImss: number | null): number {
  if (pagoImss === null) return 0;
  return pagoImss * 12;
}

/** Pago modalidad 40 total = años modalidad 40 × pago anual normal. */
export function pagoModalidad40DesdeAnual(
  cantidadAniosMod40: number,
  pagoAnualNormal: number
): number {
  return cantidadAniosMod40 * pagoAnualNormal;
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
  const edadActual = Math.max(0, Number(input.edadActual));
  const edadRetiroParaSemanas = Math.max(0, Number(input.edadRetiro));
  const semanasActuales = Math.max(0, Math.round(Number(input.semanasActuales)));
  const semanasDisponibles = Math.max(
    0,
    Math.round((edadRetiroParaSemanas - edadActual) * 52 * 2)
  );
  const semanasFaltantesDinamicas = Math.max(0, semanasDisponibles - semanasActuales);

  const semanasTotal = semanasCotizadasTotales(semanasActuales, semanasFaltantesDinamicas);
  // Excel: B11 = MAX(B4 - 500, 0), donde B4 = semanas cotizadas.
  // En este modelo, B4 corresponde al total cotizado (actuales + faltantes).
  const semanasCotizadas = semanasTotal;
  const semanasExcedentes = semanasExcedentesDesdeCotizadas(semanasCotizadas);
  const numIncrementos = numeroIncrementosDesdeSemanasExcedentes(semanasExcedentes);
  const sueldo = input.sueldoPromedioMensual;
  const uma = input.umaMensual;

  const vecesU = vecesUma(sueldo, uma);
  const rangoUma = rangoUmaDesdeVecesUma(vecesU);
  const pctIncrementoSalarial = incrementoSalarialDesdeVecesUma(vecesU);
  const factorIncremento = factorIncrementoDesdeValores(
    numIncrementos,
    pctIncrementoSalarial
  );
  const salarioPromedioAnual = salarioPromedioAnualDesdeMensual(sueldo);
  const sueldoPagadoImssMensual = sueldoImssMensualDesdeNominal(
    sueldo,
    input.factorImssVsNominal
  );

  const edadRetiro = Number(input.edadRetiro);
  const factorEdad = factorEdadDesdeEdadRetiro(edadRetiro);
  const edadRetiroAcotada = Math.min(65, Math.max(60, edadRetiro));
  const aniosMod40 = aniosModalidad40(edadRetiroAcotada, input.edadInicioMod40);
  const totalSalarioHistorial = totalSalarioHistorialImss(
    sueldoPagadoImssMensual,
    input.aniosConSueldoPromedio
  );

  const salarioIncrementadoMod40 = salarioIncrementadoPorMod40(
    factorIncremento,
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

  const usaSalario250ImssManual = input.salarioPromedio250ImssCaptura > EPS;
  const baseSalarioParaPension = usaSalario250ImssManual
    ? input.salarioPromedio250ImssCaptura
    : salarioPromedioImssCombinadoVal;

  const salarioPromedio250 =
    usaSalario250ImssManual
      ? input.salarioPromedio250ImssCaptura
      : salarioPromedioImssCombinadoVal;
  const pagoImss = pagoImssDesdeSalario250(salarioPromedio250);
  const pagoAnualNormal = pagoAnualDesdePagoImss(pagoImss);
  const udis = divisionSegura(pagoAnualNormal, input.valorUdi);
  const aniosEnMod40 = Math.max(0, input.cantidadAniosMod40);
  const pagoTotalUdisModalidad =
    udis === null ? null : udis * aniosEnMod40;
  const pagoModalidad40Total = pagoModalidad40DesdeAnual(
    input.cantidadAniosMod40,
    pagoAnualNormal
  );

  const promedioSalario = promedioSalarioAjustado(
    baseSalarioParaPension,
    sueldo,
    sueldoPagadoImssMensual
  );

  const pensionActual =
    salarioPromedio250 !== null
      ? salarioPromedio250 * factorIncremento * factorEdad
      : 0;
  const nuevaPension =
    salarioPromedio250 !== null
      ? salarioPromedio250 * factorIncremento * factorEdad
      : null;

  const diferencia =
    nuevaPension !== null ? nuevaPension - pensionActual : null;

  const pensionConProyecto = nuevaPension;

  return {
    semanasFaltantesCalculadas: semanasFaltantesDinamicas,
    semanasTotal,
    semanasExcedentes,
    numIncrementos,
    vecesUma: vecesU,
    rangoUma,
    pctIncrementoSalarial,
    factorEdad,
    factorIncremento,
    salarioPromedioAnual,
    sueldoPagadoImssMensual,
    aniosMod40,
    salarioPromedio250,
    pagoImss,
    pagoAnualNormal,
    udis,
    pagoTotalUdisModalidad,
    pagoModalidad40Total,
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
    usaSalario250ImssManual,
  };
}
