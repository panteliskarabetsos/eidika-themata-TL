import jwt from "jsonwebtoken";

export function requireAuth(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    const err = new Error("Unauthorized: missing Bearer token");
    err.status = 401;
    throw err;
  }

  const token = match[1];

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error(
      e?.name === "TokenExpiredError"
        ? "Unauthorized: token expired"
        : "Unauthorized: invalid token"
    );
    err.status = 401;
    throw err;
  }
}
