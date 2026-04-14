import type { ModalidadInputs } from "./formulas";

export const DEFAULT_MODALIDAD_INPUTS: ModalidadInputs = {
  semanasActuales: 0,
  semanasFaltantes: 0,
  sueldoPromedioMensual: 15,
  edadRetiro: 60,
  umaMensual: 3566.22,
  rangoUma: 1,
  pctIncrementoSalarial: 0.023,
  semanasExcedentes: 0,
  numIncrementos: 0,
  factorIncremento: 1,
  factorEdad: 0.75,
  edadInicioMod40: 62,
  pagoAnualPlan: 0,
  udisPlan: 0,
  pagoTotalProyecto: 0,
  pagoTotalUdis: 0,
  pagoImss: 0,
  cantidadAniosMod40: 1,
  pagoAnualFin: 0,
  pagoModalidad40: 0,
  valorUdi: 8.82,
  udisResguardoAnio: 0,
  factorImssVsNominal: 33.84 / 15,
  aniosConSueldoPromedio: 7,
};

export function cloneDefaultModalidadInputs(): ModalidadInputs {
  return { ...DEFAULT_MODALIDAD_INPUTS };
}
