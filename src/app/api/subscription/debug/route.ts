import { NextResponse } from "next/server";

// Quick diagnostic — visit GET /api/subscription/debug in the browser
// to verify Razorpay auth is working. DELETE this route before going to production.
export async function GET() {
  const key_id = process.env.RAZORPAY_KEY_ID || "NOT SET";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "NOT SET";

  const safeKey = key_id.slice(0, 16) + "...";
  const safeSecret = key_secret !== "NOT SET" ? key_secret.slice(0, 4) + "****" : "NOT SET";

  if (key_id === "NOT SET" || key_secret === "NOT SET") {
    return NextResponse.json({
      ok: false,
      error: "Env vars not loaded — restart the dev server",
      key_id: safeKey,
    });
  }

  // Make a real Razorpay API call to test authentication
  const credentials = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return NextResponse.json({
      ok: res.ok,
      httpStatus: res.status,
      key_id: safeKey,
      key_secret: safeSecret,
      razorpayResponse: data,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      key_id: safeKey,
      error: err instanceof Error ? err.message : "Fetch failed",
    });
  }
}
