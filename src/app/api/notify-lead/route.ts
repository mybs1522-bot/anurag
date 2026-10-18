import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, serviceName, paymentStatus, date, time } =
      await req.json();

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      console.log(`[Demo Lead Notification] ${name} booked ${serviceName} (Date: ${date}, Time: ${time}, Phone: ${phone})`);
      return NextResponse.json({ success: true, demo: true });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const appointmentLine =
      date && time ? `📅 Appointment: ${date} at ${time}` : "";

    const statusEmoji =
      paymentStatus === "completed"
        ? "✅ Completed"
        : paymentStatus === "pending"
          ? "⏳ Pending"
          : "—";

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">🎉 New Lead Received!</h1>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">👤 Name</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${name}</td>
            </tr>
            <tr style="border-top: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">📞 Phone</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${phone}</td>
            </tr>
            <tr style="border-top: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">🛎️ Service</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${serviceName}</td>
            </tr>
            <tr style="border-top: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">💳 Payment</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${statusEmoji}</td>
            </tr>
            ${
              appointmentLine
                ? `<tr style="border-top: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">📅 Appointment</td>
              <td style="padding: 10px 0; font-weight: 600; font-size: 14px;">${date} at ${time}</td>
            </tr>`
                : ""
            }
          </table>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
          Studio Mehta — Lead Notification
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Studio Mehta" <${process.env.GMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `🔔 New Lead: ${name} — ${serviceName}`,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email notification error:", error);
    // Even if email fails, don't break the user flow
    return NextResponse.json({ success: true, emailSent: false });
  }
}
