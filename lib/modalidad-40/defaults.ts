import type { ModalidadInputs } from "./formulas";

export const DEFAULT_MODALIDAD_INPUTS: ModalidadInputs = {
  semanasActuales: 0,
  semanasFaltantes: 0,
  sueldoPromedioMensual: 0,
  edadRetiro: 60,
  umaMensual: 3566.22,
  edadInicioMod40: 57,
  pagoAnualPlan: 0,
  cantidadAniosMod40: 1,
  valorUdi: 8.82,
  factorImssVsNominal: 33.84 / 15,
  aniosConSueldoPromedio: 7,
  salarioPromedio250ImssCaptura: 0,
};

export function cloneDefaultModalidadInputs(): ModalidadInputs {
  return { ...DEFAULT_MODALIDAD_INPUTS };
}
