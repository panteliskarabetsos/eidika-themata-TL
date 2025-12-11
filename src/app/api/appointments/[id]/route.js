// src/app/api/appointments/[id]/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb.js";
import Appointment from "../../../../models/Appointment.js";
import Patient from "../../../../models/Patient.js";

// PUT /api/appointments/:id  -> ενημέρωση ραντεβού
export async function PUT(request, context) {
  try {
    await initDb();

    // 🔹 ΕΔΩ η αλλαγή: params είναι Promise
    const { id } = await context.params;
    const numericId = Number(id);

    if (!numericId || Number.isNaN(numericId)) {
      return new NextResponse("Invalid appointment id", { status: 400 });
    }

    const appointment = await Appointment.findByPk(numericId);
    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    const body = await request.json();
    const { dateTime, durationMinutes, status, reason } = body;

    if (dateTime) {
      appointment.dateTime = new Date(dateTime);
    }
    if (durationMinutes != null) {
      appointment.durationMinutes = Number(durationMinutes);
    }
    if (status) {
      appointment.status = status; // 'scheduled' | 'completed' | 'cancelled'
    }
    if (reason !== undefined) {
      appointment.reason = reason;
    }

    await appointment.save();

    // reload με τον patient
    await appointment.reload({
      include: [
        {
          model: Patient,
          attributes: ["id", "firstName", "lastName", "phone"],
        },
      ],
    });

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("PUT /api/appointments/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/appointments/:id  -> διαγραφή ραντεβού
export async function DELETE(request, context) {
  try {
    await initDb();

    // 🔹 Κι εδώ το ίδιο
    const { id } = await context.params;
    const numericId = Number(id);

    if (!numericId || Number.isNaN(numericId)) {
      return new NextResponse("Invalid appointment id", { status: 400 });
    }

    const appointment = await Appointment.findByPk(numericId);
    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    await appointment.destroy();

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/appointments/[id] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
