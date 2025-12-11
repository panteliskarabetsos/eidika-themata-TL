export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../lib/initDb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await initDb();

    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "fullName",
        "email",
        "isActive",
        "createdAt",
      ],
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    const { username, password, fullName, email } = body;

    if (!username || !password || !fullName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return new NextResponse("Username already exists", { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash,
      fullName,
      email,
    });

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
