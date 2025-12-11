export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await initDb();

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new NextResponse("Missing credentials", { status: 400 });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return new NextResponse("Invalid username or password", { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return new NextResponse("Invalid username or password", { status: 401 });
    }

    const payload = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return NextResponse.json({
      token,
      user: payload,
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
