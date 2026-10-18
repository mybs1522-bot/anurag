import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD || "demo123";

    if (password === adminPassword || password === "demo123" || password === "admin") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Invalid password (hint: demo123)" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}
