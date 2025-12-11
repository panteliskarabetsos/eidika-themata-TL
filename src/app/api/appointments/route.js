export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb.js";
import Appointment from "../../../models/Appointment.js";
import Patient from "../../../models/Patient.js";

export async function GET() {
  try {
    await initDb();

    const appointments = await Appointment.findAll({
      order: [["dateTime", "ASC"]],
      include: [
        {
          model: Patient,
          attributes: ["id", "firstName", "lastName", "phone"],
        },
      ],
    });

    return NextResponse.json(appointments);
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    const { patientId, dateTime, durationMinutes, reason } = body;

    if (!patientId || !dateTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const appointment = await Appointment.create({
      patientId,
      dateTime: new Date(dateTime),
      durationMinutes: durationMinutes || 30,
      reason: reason || null,
      status: "scheduled",
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    console.error("POST /api/appointments error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
