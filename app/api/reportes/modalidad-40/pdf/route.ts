import { renderToBuffer } from "@react-pdf/renderer";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createElement } from "react";
import { auth } from "@/lib/auth";
import {
  fetchCalculadoraSubscription,
  userHasCalculadoraAccess,
} from "@/lib/calculadora-subscription";
import { modalidadInputsSchema } from "@/lib/modalidad-40/modalidad-inputs-schema";
import { Modalidad40ReportDocument } from "@/lib/modalidad-40/pdf-modalidad-40-report";
import { buildPromedioActuarialVista } from "@/lib/modalidad-40/promedio-actuarial-vista";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const subscription = await fetchCalculadoraSubscription(session.user.id);
  if (!userHasCalculadoraAccess(subscription)) {
    return NextResponse.json({ error: "Sin acceso a la calculadora" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = modalidadInputsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const input = parsed.data;
  const vista = buildPromedioActuarialVista(input);
  const generatedAtLabel = new Date().toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const pdfElement = createElement(Modalidad40ReportDocument, {
    input,
    vista,
    generatedAtLabel,
  });
  const buffer = await renderToBuffer(
    pdfElement as Parameters<typeof renderToBuffer>[0]
  );

  const filename = `reporte-modalidad-40-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
