export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb.js";
import { createContainer } from "../../../../di/container.js";

function parseNumericId(id) {
  const numericId = Number(id);
  if (!numericId || Number.isNaN(numericId)) return null;
  return numericId;
}

export async function PUT(request, { params }) {
  try {
    await initDb();

    const numericId = parseNumericId(params.id);
    if (!numericId) {
      return NextResponse.json(
        { message: "Invalid appointment id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { appointmentService } = createContainer();
    const updated = await appointmentService.updateAppointment(numericId, body);

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/appointments/[id] error:", err);

    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    await initDb();

    const numericId = parseNumericId(params.id);
    if (!numericId) {
      return NextResponse.json(
        { message: "Invalid appointment id" },
        { status: 400 }
      );
    }

    const { appointmentService } = createContainer();
    await appointmentService.deleteAppointment(numericId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/appointments/[id] error:", err);

    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}
