import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, leadId, type } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !leadId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isDemo =
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
      razorpay_order_id.startsWith("order_demo_") ||
      razorpay_payment_id.startsWith("pay_demo_");

    if (!isDemo) {
      // 1. Verify payment signature in real mode
      const secret = process.env.RAZORPAY_KEY_SECRET || "";
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const supabase = getSupabaseAdmin();

    if (type === "service") {
      // 2. Fetch the pending lead
      const { data: lead } = await supabase
        .from("service_leads")
        .select(`id, name, phone, appointment_date, appointment_time, service_id, services(title)`)
        .eq("id", leadId)
        .single();

      const nameWithPayment = `${lead?.name || "Client"} (TXN: ${razorpay_payment_id})`;
      const serviceName = (lead?.services as any)?.title || "Consultation Call";

      // 3. Update database
      await supabase
        .from("service_leads")
        .update({
          name: nameWithPayment,
          payment_status: "completed",
          paid_at: new Date().toISOString(),
          razorpay_order_id,
        })
        .eq("id", leadId);

      // 4. Send email notification (non-blocking)
      fetch(`${req.nextUrl.origin}/api/notify-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameWithPayment,
          phone: lead?.phone || "",
          serviceName: serviceName,
          paymentStatus: "completed",
          date: lead?.appointment_date
            ? new Date(lead.appointment_date).toLocaleDateString()
            : null,
          time: lead?.appointment_time,
        }),
      }).catch(console.error);

    } else if (type === "book") {
      // Reconcile book lead
      await supabase
        .from("book_leads")
        .update({
          payment_status: "completed",
          paid_at: new Date().toISOString(),
          razorpay_order_id,
        })
        .eq("id", leadId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
