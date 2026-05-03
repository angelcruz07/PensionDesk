import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  formatCurrency,
  formatInteger,
  formatNumber,
  formatPercentFromRate,
} from "../format";
import type { ModalidadDerived } from "./formulas";
import type { ModalidadInputs } from "./formulas";
import type { PromedioActuarialVista } from "./promedio-actuarial-vista";

const WHATSAPP_URL = "https://wa.me/message/QXJBFUR5KI32L1";

/** Pie legal idéntico en todas las páginas (disclaimer Pensión 360 / IMSS). */
const LEGAL_FOOTER_COPY =
  "Este documento es informativo y surge del simulador Pensión 360. No sustituye dictamen, cálculo oficial del IMSS ni asesoría legal, fiscal o actuarial. Para decisiones relevantes consulta fuentes oficiales y profesionales certificados.";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    /** Espacio reservado para el footer fijo (línea + texto legal). */
    paddingBottom: 62,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#171717",
    lineHeight: 1.4,
  },
  coverTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  brandLine: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: "#1e3a5f",
    marginBottom: 14,
  },
  meta: {
    fontSize: 8,
    color: "#525252",
    textAlign: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 6,
  },
  body: {
    fontSize: 9,
    color: "#262626",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 3,
    paddingLeft: 4,
  },
  highlightNumber: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f766e",
    marginVertical: 6,
    textAlign: "center",
    padding: 8,
    backgroundColor: "#f0fdfa",
    borderWidth: 1,
    borderColor: "#99f6e4",
    borderRadius: 4,
  },
  diagBox: {
    marginTop: 6,
    marginBottom: 6,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  diagAlto: { backgroundColor: "#ecfdf5", borderColor: "#6ee7b7" },
  diagMedio: { backgroundColor: "#fffbeb", borderColor: "#fcd34d" },
  diagBajo: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  diagTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  diagText: { fontSize: 8.5, lineHeight: 1.35 },
  h2: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 3,
  },
  annexTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#1e3a5f",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f5f5f5",
  },
  label: { width: "58%", paddingRight: 6, color: "#404040" },
  value: {
    width: "42%",
    textAlign: "right",
    fontFamily: "Courier",
  },
  /** Notas al pie de página (no legal): sin línea duplicada; el legal va en ReportLegalFooter. */
  footer: {
    marginTop: 12,
    paddingTop: 8,
    fontSize: 7,
    color: "#737373",
    lineHeight: 1.35,
  },
  legalFooterFixed: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
  },
  legalFooterRule: {
    borderTopWidth: 1,
    borderTopColor: "#d4d4d8",
    marginBottom: 6,
  },
  legalFooterText: {
    fontSize: 7,
    lineHeight: 1.35,
    color: "#737373",
    textAlign: "left",
  },
  contactLine: {
    fontSize: 9,
    marginBottom: 3,
  },
  link: {
    color: "#0369a1",
    textDecoration: "underline",
  },
  /** Página dedicada solo a contacto + cierre; contenido centrado verticalmente. */
  contactPageBody: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 32,
    minHeight: 520,
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/** Pie legal idéntico al pie de cada `<Page>` (varias páginas explícitas → una instancia por página). */
function ReportLegalFooter() {
  return (
    <View style={styles.legalFooterFixed}>
      <View style={styles.legalFooterRule} />
      <Text style={styles.legalFooterText}>{LEGAL_FOOTER_COPY}</Text>
    </View>
  );
}

type DiagnosticoNivel = "alto" | "medio" | "bajo";

function diagnosticoDesdeDerived(derived: ModalidadDerived): {
  nivel: DiagnosticoNivel;
  titulo: string;
  texto: string;
} {
  const base = Math.max(Math.abs(derived.pensionActual), 1e-6);
  const ratio = derived.diferencia / base;
  if (ratio > 0.08 || derived.diferencia > 2000) {
    return {
      nivel: "alto",
      titulo: "Perfil con potencial alto",
      texto:
        "Tu perfil indica que podrías acceder a estrategias avanzadas para incrementar significativamente tu pensión respecto al escenario base.",
    };
  }
  if (derived.diferencia > -1e-6) {
    return {
      nivel: "medio",
      titulo: "Perfil con potencial medio",
      texto:
        "Existe oportunidad de mejora; conviene estructurar correctamente una estrategia acorde a tus años de cotización y objetivos de retiro.",
    };
  }
  return {
    nivel: "bajo",
    titulo: "Perfil con necesidad de estrategia",
    texto:
      "Tu pensión proyectada con los datos actuales puede ser limitada frente a tus metas; es recomendable analizar opciones para mejorar tu situación antes del retiro.",
  };
}

export type Modalidad40ReportDocumentProps = {
  input: ModalidadInputs;
  vista: PromedioActuarialVista;
  generatedAtLabel: string;
};

export function Modalidad40ReportDocument({
  input,
  vista,
  generatedAtLabel,
}: Modalidad40ReportDocumentProps) {
  const { derived } = vista;
  const diag = diagnosticoDesdeDerived(derived);
  const diagStyle =
    diag.nivel === "alto"
      ? styles.diagAlto
      : diag.nivel === "medio"
        ? styles.diagMedio
        : styles.diagBajo;

  return (
    <Document title="Proyección de pensión personalizada" language="es">
      {/* Narrativa + marca */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.coverTitle}>Proyección de pensión personalizada</Text>
        <Text style={styles.brandLine}>Tu Futuro Seguro</Text>
        <Text style={styles.meta}>Documento generado el {generatedAtLabel}</Text>

        <Text style={styles.sectionTitle}>Resumen</Text>
        <Text style={styles.body}>
          Este reporte ha sido generado con base en la información que proporcionaste,
          considerando los lineamientos del Instituto Mexicano del Seguro Social bajo el esquema de
          pensión correspondiente (escenario Modalidad 40 / simulación del modelo).
        </Text>
        <Text style={styles.body}>El objetivo es brindarte claridad sobre:</Text>
        <Text style={styles.bullet}>• Tu pensión estimada en distintos escenarios.</Text>
        <Text style={styles.bullet}>• Qué sucedería si no realizas cambios en tu estrategia.</Text>
        <Text style={styles.bullet}>
          • Qué opciones existen para mejorar tu retiro según los resultados del simulador.
        </Text>

        <Text style={styles.sectionTitle}>Resultado de tu pensión</Text>
        <Text style={styles.body}>
          Pensión estimada mensual (escenario con estrategia Modalidad 40 según el modelo):
        </Text>
        <Text style={styles.highlightNumber}>{formatCurrency(derived.nuevaPension)}</Text>
        <Text style={styles.body}>
          Este monto representa una estimación del ingreso mensual proyectado con los parámetros
          capturados y las reglas del simulador. Pensión estimada sin estrategia adicional (solo
          escenario base): {formatCurrency(derived.pensionActual)}. Diferencia proyectada:{" "}
          {formatCurrency(derived.diferencia)}.
        </Text>

        <Text style={styles.sectionTitle}>Escenario sin estrategia</Text>
        <Text style={styles.body}>Si no realizas ninguna acción adicional:</Text>
        <Text style={styles.bullet}>
          • Tu ingreso mensual estimado bajo el escenario base sería de{" "}
          {formatCurrency(derived.pensionActual)}.
        </Text>
        <Text style={styles.bullet}>• Depende del historial de cotización y factores del modelo.</Text>
        <Text style={styles.bullet}>
          • No incorpora por sí mismo optimizaciones fuera de los datos capturados.
        </Text>
        <Text style={styles.body}>
          Importante: en muchos casos este ingreso puede no alcanzar el estilo de vida deseado en el
          retiro; el simulador sirve para contrastar escenarios, no como dictamen oficial del IMSS.
        </Text>

        <Text style={styles.sectionTitle}>Diagnóstico de tu situación</Text>
        <View style={[styles.diagBox, diagStyle]} wrap={false}>
          <Text style={styles.diagTitle}>{diag.titulo}</Text>
          <Text style={styles.diagText}>{diag.texto}</Text>
        </View>

        <View style={styles.footer} wrap={false}>
          <Text>
            Los importes son estimaciones. Continúa en la siguiente página: oportunidades,
            siguiente paso, contacto y detalle técnico del cálculo.
          </Text>
        </View>

        <ReportLegalFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Oportunidad clave</Text>
        <Text style={styles.body}>
          Independientemente de tu resultado en esta simulación: si cuentas con ingresos
          adicionales, negocios, comisiones o flujo extra, podrías valorar —con asesoría
          profesional— estrategias financieras alineadas a la regulación vigente para trabajar en tu
          proyecto de retiro.
        </Text>
        <Text style={styles.body}>
          En muchos casos, en asesorías se analizan aportaciones mensuales de distinto orden (como
          referencia, algunas estrategias de mercado se plantean desde aproximadamente $4,000 MXN
          mensuales, según perfil y producto) para trabajar en:
        </Text>
        <Text style={styles.bullet}>• Incrementar o acotar tu proyección de pensión.</Text>
        <Text style={styles.bullet}>• Optimizar tu retiro con plazos y reglas claras.</Text>
        <Text style={styles.bullet}>• Buscar estabilidad financiera a largo plazo.</Text>

        <Text style={styles.sectionTitle}>Siguiente paso</Text>
        <Text style={styles.body}>Cada caso es único. Un análisis personalizado puede ayudarte a:</Text>
        <Text style={styles.bullet}>• Identificar qué estrategia encaja con tu perfil.</Text>
        <Text style={styles.bullet}>• Acotar montos y horizontes con datos reales.</Text>
        <Text style={styles.bullet}>• Maximizar el valor de la información que ya tienes.</Text>

        <ReportLegalFooter />
      </Page>

      {/* Una sola página exclusiva para contacto y cierre */}
      <Page size="A4" style={[styles.page, { flexDirection: "column" }]}>
        <View style={styles.contactPageBody} wrap={false}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <Text style={styles.contactLine}>Agenda una asesoría personalizada:</Text>
          <Text style={[styles.contactLine, { fontFamily: "Helvetica-Bold", marginTop: 4 }]}>
            Yitzhak Núñez – Tu Futuro Seguro
          </Text>
          <Text style={[styles.body, { marginTop: 6 }]}>
            Especialistas en estrategias de pensión y optimización financiera.
          </Text>
          <Text style={[styles.contactLine, { marginTop: 8 }]}>
            WhatsApp: <Text style={styles.link}>{WHATSAPP_URL}</Text>
          </Text>
          <Text style={[styles.body, { marginTop: 6 }]}>Atención personalizada.</Text>
          <Text
            style={[
              styles.body,
              { marginTop: 20, fontFamily: "Helvetica-Oblique", fontSize: 10, textAlign: "center" },
            ]}
          >
            Tu pensión no es un número… es tu futuro.
          </Text>
        </View>
        <ReportLegalFooter />
      </Page>

      {/* Anexo técnico */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.annexTitle}>Anexo: detalle técnico del simulador</Text>
        <Text style={[styles.meta, { textAlign: "left", marginBottom: 10 }]}>
          Parámetros y derivados utilizados para las cifras anteriores.
        </Text>

        <Text style={styles.h2}>Parámetros capturados</Text>
        <Row
          label="Semanas cotizadas actuales"
          value={formatInteger(input.semanasActuales)}
        />
        <Row label="Sueldo promedio mensual" value={formatCurrency(input.sueldoPromedioMensual)} />
        <Row label="Edad actual" value={`${formatInteger(input.edadActual)} años`} />
        <Row label="Edad de retiro" value={`${formatInteger(input.edadRetiro)} años`} />
        <Row label="UMA mensual" value={formatCurrency(input.umaMensual)} />
        <Row
          label="Edad inicio Modalidad 40"
          value={`${formatInteger(input.edadInicioMod40)} años`}
        />
        <Row
          label="Años con sueldo promedio"
          value={`${formatInteger(input.aniosConSueldoPromedio)} años`}
        />
        <Row
          label="Salario prom. 250 sem. IMSS (mensual)"
          value={formatCurrency(input.salarioPromedio250ImssCaptura)}
        />
        <Row label="Valor UDI" value={formatNumber(input.valorUdi, 2)} />
        <Row label="Plan anual (captura)" value={formatCurrency(input.pagoAnualPlan)} />

        <Text style={styles.h2}>Resumen numérico</Text>
        <Row label="Pensión estimada (escenario base)" value={formatCurrency(derived.pensionActual)} />
        <Row label="Nueva pensión (Modalidad 40)" value={formatCurrency(derived.nuevaPension)} />
        <Row label="Diferencia" value={formatCurrency(derived.diferencia)} />

        <Text style={styles.h2}>Escenario sin estrategia financiera (detalle)</Text>
        <Row label="Salario promedio mensual" value={formatCurrency(input.sueldoPromedioMensual)} />
        <Row
          label="Promedio salario anual"
          value={formatCurrency(derived.salarioPromedioAnual)}
        />
        <Row
          label="Años en salario normal"
          value={`${formatInteger(vista.aniosSalarioNormal)} años`}
        />
        <Row
          label="Pago mensual al IMSS (salario normal)"
          value={formatCurrency(vista.pagoMensualImssSalarioNormal)}
        />
        <Row
          label="Pago anual al IMSS (salario normal)"
          value={formatCurrency(vista.pagoAnualImssSalarioNormal)}
        />
        <Row
          label="Pago total años con salario normal"
          value={formatCurrency(vista.pagoTotalAniosSalarioNormal)}
        />

        <ReportLegalFooter />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.annexTitle}>Anexo (continuación)</Text>
        <Text style={[styles.meta, { textAlign: "left", marginBottom: 10 }]}>
          Escenario Modalidad 40 y derivados del modelo.
        </Text>

        <Text style={styles.h2}>Escenario con estrategia Modalidad 40 (detalle)</Text>
        <Row
          label="Salario promedio mensual (panel Mod. 40)"
          value={formatCurrency(vista.salarioPromedioMensualMod40)}
        />
        <Row
          label="Promedio salario anual (panel Mod. 40)"
          value={formatCurrency(vista.salarioPromedioAnualMod40)}
        />
        <Row
          label="Años en Modalidad 40"
          value={`${formatInteger(derived.aniosMod40)} años`}
        />
        <Row
          label="Pago mensual al IMSS (Mod. 40)"
          value={formatCurrency(vista.pagoMensualImssMod40)}
        />
        <Row
          label="Pago anual al IMSS (Mod. 40)"
          value={formatCurrency(vista.pagoAnualImssMod40)}
        />
        <Row
          label="Pago total años en Modalidad 40"
          value={formatCurrency(vista.pagoTotalAniosMod40)}
        />
        <Row
          label="Suma de ambos salarios (normal + Mod. 40)"
          value={formatCurrency(vista.sumaAmbosSalarios)}
        />
        <Row
          label="Suma total pagada al IMSS (normal + Mod. 40)"
          value={formatCurrency(vista.sumaTotalImssPagadoNormalYMod40)}
        />
        <Row
          label="Salario promedio combinado"
          value={formatCurrency(vista.salarioPromedioCombinado)}
        />
        <Row
          label="Porcentaje de pensión (sobre tope ley)"
          value={`${formatInteger(vista.porcentajePensionRedondeado)} %`}
        />
        <Row label="Promedio salario (panel)" value={formatCurrency(vista.promedioSalarioPaneles)} />
        <Row
          label="Pensión con proyecto y salario"
          value={formatCurrency(vista.pensionConProyectoYSalario)}
        />

        <Text style={styles.h2}>Derivados del modelo</Text>
        <Row label="Total semanas cotizadas" value={formatInteger(derived.semanasTotal)} />
        <Row
          label="Semanas cotizadas faltantes"
          value={formatInteger(derived.semanasFaltantesCalculadas)}
        />
        <Row label="Semanas excedentes" value={formatInteger(derived.semanasExcedentes)} />
        <Row label="Veces UMA" value={formatNumber(derived.vecesUma, 1)} />
        <Row label="Rango UMA" value={derived.rangoUma} />
        <Row
          label="Incremento salarial"
          value={formatPercentFromRate(derived.pctIncrementoSalarial)}
        />
        <Row label="Número de incrementos" value={formatInteger(derived.numIncrementos)} />
        <Row label="Factor incremento" value={formatNumber(derived.factorIncremento, 2)} />
        <Row label="Factor edad" value={formatNumber(derived.factorEdad, 2)} />
        <Row
          label="Pago Modalidad 40 (derivado)"
          value={formatCurrency(derived.pagoModalidad40Total)}
        />
        <Row label="Pago al IMSS (derivado)" value={formatCurrency(derived.pagoImss)} />
        <Row
          label="UDIs de resguardo al año"
          value={derived.udis === null ? "—" : formatNumber(derived.udis, 2)}
        />

        <ReportLegalFooter />
      </Page>
    </Document>
  );
}
