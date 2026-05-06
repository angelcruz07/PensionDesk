import {
  calcDerived,
  MAX_ANIOS_MODALIDAD_40,
  pagoAnualDesdePagoImss,
  pagoImssDesdeSalario250,
  type ModalidadDerived,
  type ModalidadInputs,
} from "./formulas";

export const TOPE_LEY_ANUAL = 177722.8;
export const TOPE_PENSION_100 = 78800;

export type PromedioActuarialVista = {
  derived: ModalidadDerived;
  aniosSalarioNormal: number;
  pagoMensualImssSalarioNormal: number;
  pagoAnualImssSalarioNormal: number;
  pagoTotalAniosSalarioNormal: number;
  salarioPromedioMensualMod40: number;
  salarioPromedioAnualMod40: number;
  pagoMensualImssMod40: number;
  pagoAnualImssMod40: number;
  pagoTotalAniosMod40: number;
  sumaAmbosSalarios: number;
  sumaTotalImssPagadoNormalYMod40: number;
  salarioPromedioCombinado: number;
  porcentajePensionRedondeado: number;
  promedioSalarioPaneles: number;
  pensionConProyectoYSalario: number;
};

/** Mismos cálculos que `Modalidad40Calculator` (tarjetas de promedio actuarial). */
export function buildPromedioActuarialVista(input: ModalidadInputs): PromedioActuarialVista {
  const derived = calcDerived(input);
  const aniosSalarioNormal = Math.max(0, MAX_ANIOS_MODALIDAD_40 - derived.aniosMod40);

  const pagoMensualImssSalarioNormal = pagoImssDesdeSalario250(input.sueldoPromedioMensual);
  const pagoAnualImssSalarioNormal = pagoAnualDesdePagoImss(pagoMensualImssSalarioNormal);
  const pagoTotalAniosSalarioNormal = pagoAnualImssSalarioNormal * aniosSalarioNormal;

  const salarioPromedioMensualMod40 = input.salarioPromedio250ImssCaptura;
  const salarioPromedioAnualMod40 = salarioPromedioMensualMod40 * 12;
  const pagoMensualImssMod40 = pagoImssDesdeSalario250(salarioPromedioMensualMod40);
  const pagoAnualImssMod40 = pagoAnualDesdePagoImss(pagoMensualImssMod40);
  const pagoTotalAniosMod40 = pagoAnualImssMod40 * derived.aniosMod40;

  const sumaAmbosSalarios = input.sueldoPromedioMensual + salarioPromedioMensualMod40;
  const sumaTotalImssPagadoNormalYMod40 =
    pagoTotalAniosSalarioNormal + pagoTotalAniosMod40;
  const salarioPromedioCombinado = sumaTotalImssPagadoNormalYMod40 / 5;
  const porcentajePensionSobreTope =
    TOPE_LEY_ANUAL > 0 ? salarioPromedioCombinado / TOPE_LEY_ANUAL : 0;
  const porcentajePensionRedondeado = Math.round(porcentajePensionSobreTope * 100);
  const promedioSalarioPaneles =
    (porcentajePensionRedondeado / 100) * TOPE_PENSION_100;
  const pensionConProyectoYSalario = promedioSalarioPaneles * derived.factorEdad;

  return {
    derived,
    aniosSalarioNormal,
    pagoMensualImssSalarioNormal,
    pagoAnualImssSalarioNormal,
    pagoTotalAniosSalarioNormal,
    salarioPromedioMensualMod40,
    salarioPromedioAnualMod40,
    pagoMensualImssMod40,
    pagoAnualImssMod40,
    pagoTotalAniosMod40,
    sumaAmbosSalarios,
    sumaTotalImssPagadoNormalYMod40,
    salarioPromedioCombinado,
    porcentajePensionRedondeado,
    promedioSalarioPaneles,
    pensionConProyectoYSalario,
  };
}
