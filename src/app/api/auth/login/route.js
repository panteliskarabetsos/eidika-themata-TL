export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb";
import { createContainer } from "../../../../di/container.js";

export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    const { authService } = createContainer();

    const result = await authService.login(body);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);

    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}
