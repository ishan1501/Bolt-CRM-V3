import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("[create-order] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in env");
      return NextResponse.json(
        { error: "Razorpay credentials not set — restart the dev server after updating .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log(`[create-order] key_id=${key_id.slice(0, 20)}... email=${email}`);

    // Use the official Razorpay Node SDK (more reliable auth than manual fetch)
    const razorpay = new Razorpay({ key_id, key_secret });

    const order = await razorpay.orders.create({
      amount: 15000, // ₹150 in paise
      currency: "INR",
      receipt: `bolt_${Date.now()}`,
      notes: { email } as Record<string, string>,
    });

    console.log(`[create-order] Order created successfully: ${order.id}`);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
    });
  } catch (err: unknown) {
    // Razorpay SDK throws structured errors
    const rzpErr = err as { error?: { description?: string; code?: string }; message?: string };
    const description = rzpErr?.error?.description || rzpErr?.message || "Unknown error";
    const code = rzpErr?.error?.code || "";

    console.error(`[create-order] Error: [${code}] ${description}`, err);

    return NextResponse.json(
      { error: description, code },
      { status: 500 }
    );
  }
}
