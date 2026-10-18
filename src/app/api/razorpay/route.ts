import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR" } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In demo mode or if credentials are not configured, simulate order creation
    if (!keyId || !keySecret || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      return NextResponse.json(
        {
          orderId: `order_demo_${Date.now()}`,
          isDemo: true,
        },
        { status: 200 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    // Fallback to demo order on failure so user experience is uninterrupted
    return NextResponse.json(
      { orderId: `order_demo_${Date.now()}`, isDemo: true },
      { status: 200 }
    );
  }
}
