export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb";
import { createContainer } from "../../../../di/container";

function parseId(id) {
  const n = Number(id);
  if (!n || Number.isNaN(n)) return null;
  return n;
}

export async function PUT(request, context) {
  try {
    await initDb();

    const params = await context.params;
    const id = parseId(params.id);

    if (!id) return new NextResponse("Invalid patient id", { status: 400 });

    const body = await request.json();
    const { patientService } = createContainer();
    const updated = await patientService.updatePatient(id, body);

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/patients/[id] error:", err);
    return new NextResponse(err?.message || "Internal Server Error", {
      status: err?.status || 500,
    });
  }
}

export async function DELETE(request, context) {
  try {
    await initDb();

    const params = await context.params;
    const id = parseId(params.id);

    if (!id) return new NextResponse("Invalid patient id", { status: 400 });

    const { patientService } = createContainer();
    await patientService.deletePatient(id);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/patients/[id] error:", err);
    return new NextResponse(err?.message || "Internal Server Error", {
      status: err?.status || 500,
    });
  }
}
