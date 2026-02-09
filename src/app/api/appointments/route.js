export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb.js";
import { createContainer } from "../../../di/container.js";

export async function GET() {
  try {
    await initDb();
    requireAuth(request);

    const { appointmentService } = createContainer();
    const appointments = await appointmentService.listAppointments();

    return NextResponse.json(appointments, { status: 200 });
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    const { appointmentService } = createContainer();
    const appointment = await appointmentService.createAppointment(body);

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    console.error("POST /api/appointments error:", err);

    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}
