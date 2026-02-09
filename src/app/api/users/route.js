export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb";
import { createContainer } from "../../../di/container"; // <--- Dependency Injection
import { requireAuth } from "../../../lib/auth"; // <--- Security

export async function GET(request) {
  try {
    await initDb();
    
    const claims = requireAuth(request);
    // Προαιρετικά: if (claims.role !== 'admin') return 403...


    const { userRepository } = createContainer(); 
    
    const users = await userRepository.findAll();

    const safeUsers = users.map(u => {
        const json = u.toJSON ? u.toJSON() : u;
        const { passwordHash, ...safe } = json;
        return safe;
    });

    return NextResponse.json(safeUsers);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
        { message: err?.message || "Internal Server Error" }, 
        { status: err?.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    
    // 3. Χρήση του Auth Service μέσω DI
    const { authService } = createContainer();
    
    const newUser = await authService.register(body);

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json(
        { message: err?.message || "Internal Server Error" }, 
        { status: err?.status || 500 }
    );
  }
}
