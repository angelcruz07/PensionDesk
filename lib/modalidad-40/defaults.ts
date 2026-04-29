import type { ModalidadInputs } from "./formulas";

export const DEFAULT_MODALIDAD_INPUTS: ModalidadInputs = {
  semanasActuales: 0,
  semanasFaltantes: 0,
  sueldoPromedioMensual: 0,
  edadActual: 50,
  edadRetiro: 60,
  umaMensual: 3566.22,
  edadInicioMod40: 57,
  pagoAnualPlan: 0,
  valorUdi: 8.82,
  aniosConSueldoPromedio: 7,
  salarioPromedio250ImssCaptura: 0,
};

export function cloneDefaultModalidadInputs(): ModalidadInputs {
  return { ...DEFAULT_MODALIDAD_INPUTS };
}
