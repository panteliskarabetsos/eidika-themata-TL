export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb";
import { createContainer } from "../../../di/container";

export async function GET() {
  try {
    await initDb();

    const { patientService } = createContainer();
    const patients = await patientService.listPatients();

    return NextResponse.json(patients, { status: 200 });
  } catch (err) {
    console.error("GET /api/patients error:", err);
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

    const { patientService } = createContainer();
    const patient = await patientService.createPatient(body);

    return NextResponse.json(patient, { status: 201 });
  } catch (err) {
    console.error("POST /api/patients error:", err);

    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";

    return NextResponse.json({ message }, { status });
  }
}
