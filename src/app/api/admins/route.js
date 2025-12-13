export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb.js";
import { createContainer } from "../../../di/container.js";
import { requireAuth } from "../../../lib/auth.js";

export async function GET(request) {
  try {
    await initDb();
    requireAuth(request);

    const { adminService } = createContainer();
    const admins = await adminService.listAdmins();

    return NextResponse.json(admins, { status: 200 });
  } catch (err) {
    console.error("GET /api/admins error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal Server Error" },
      { status: err?.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDb();
    requireAuth(request);

    const body = await request.json();
    const { adminService } = createContainer();
    const created = await adminService.createAdmin(body);

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/admins error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal Server Error" },
      { status: err?.status || 500 }
    );
  }
}
