// src/app/api/patients/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb";
import Patient from "../../../models/Patient";

// GET /api/patients
export async function GET() {
  try {
    await initDb();

    const patients = await Patient.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(patients);
  } catch (err) {
    console.error("GET /api/patients error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/patients
export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    const { firstName, lastName, phone, email, dateOfBirth, notes } = body;

    if (!firstName || !lastName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const patient = await Patient.create({
      firstName,
      lastName,
      phone,
      email,
      dateOfBirth: dateOfBirth || null,
      notes,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (err) {
    console.error("POST /api/patients error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
