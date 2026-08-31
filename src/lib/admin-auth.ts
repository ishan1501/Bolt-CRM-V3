import { NextRequest, NextResponse } from "next/server";

/**
 * Validates that the incoming request carries the correct admin token.
 * The token must be sent in the `X-Admin-Token` header.
 * The expected token is stored in the `ADMIN_SECRET_TOKEN` environment variable.
 *
 * Returns null if the request is authorized.
 * Returns a 401 NextResponse if not authorized.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const adminToken = process.env.ADMIN_SECRET_TOKEN;

  // If no secret is configured server-side, block all access for safety.
  if (!adminToken) {
    console.error("[Admin Auth] ADMIN_SECRET_TOKEN env var is not set. Blocking access.");
    return NextResponse.json(
      { error: "Admin access is not configured." },
      { status: 500 }
    );
  }

  const providedToken = req.headers.get("X-Admin-Token");

  if (!providedToken || providedToken !== adminToken) {
    console.warn("[Admin Auth] Unauthorized access attempt blocked.");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null; // Authorized
}
