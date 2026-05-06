import { z } from "zod";
import type { ModalidadInputs } from "./formulas";

const fin = () => z.number().finite();

export const modalidadInputsSchema: z.ZodType<ModalidadInputs> = z.object({
  semanasActuales: fin(),
  semanasFaltantes: fin(),
  sueldoPromedioMensual: fin(),
  edadActual: fin(),
  edadRetiro: fin(),
  umaMensual: fin(),
  edadInicioMod40: fin(),
  pagoAnualPlan: fin(),
  valorUdi: fin(),
  aniosConSueldoPromedio: fin(),
  salarioPromedio250ImssCaptura: fin(),
});
