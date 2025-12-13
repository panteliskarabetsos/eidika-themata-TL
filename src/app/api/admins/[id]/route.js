export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb.js";
import { createContainer } from "../../../../di/container.js";
import { requireAuth } from "../../../../lib/auth.js";

function parseId(id) {
  const n = Number(id);
  if (!n || Number.isNaN(n)) return null;
  return n;
}

export async function PUT(request, context) {
  try {
    await initDb();

    const claims = requireAuth(request);
    const params = await context.params;
    const id = parseId(params.id);

    if (!id)
      return NextResponse.json(
        { message: "Invalid admin id" },
        { status: 400 }
      );

    const body = await request.json();
    const { adminService } = createContainer();

    const updated = await adminService.updateAdmin(id, body, claims.id);

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/admins/[id] error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal Server Error" },
      { status: err?.status || 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await initDb();

    const claims = requireAuth(request);
    const params = await context.params;
    const id = parseId(params.id);

    if (!id)
      return NextResponse.json(
        { message: "Invalid admin id" },
        { status: 400 }
      );

    const { adminService } = createContainer();
    await adminService.deleteAdmin(id, claims.id);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/admins/[id] error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal Server Error" },
      { status: err?.status || 500 }
    );
  }
}
