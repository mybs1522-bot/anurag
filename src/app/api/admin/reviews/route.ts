import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag";
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    // Check if reset is requested
    if (body.action === "reset") {
      // In demo mode, reset reviews table
      const { error: delErr } = await supabase.from("reviews").delete().neq("id", "none");
      if (delErr) {
        return NextResponse.json({ error: delErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Reset to default demo reviews" });
    }

    const { name, role, content, rating, status, avatar_url } = body;

    if (!name || !content) {
      return NextResponse.json({ error: "Name and review content are required" }, { status: 400 });
    }

    const newReview = {
      id: `r_${Date.now()}`,
      tenant_id: body.tenant_id || process.env.NEXT_PUBLIC_TENANT_ID || "tenant_demo",
      name: name.trim(),
      role: (role || "Verified Client").trim(),
      content: content.trim(),
      rating: Number(rating) || 5,
      status: status || "approved",
      avatar_url:
        avatar_url ||
        `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("reviews").insert([newReview]).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data || newReview });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create review" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, role, content, rating, status, avatar_url } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name.trim();
    if (role !== undefined) updates.role = role.trim();
    if (content !== undefined) updates.content = content.trim();
    if (rating !== undefined) updates.rating = Number(rating);
    if (status !== undefined) updates.status = status;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { error } = await supabase.from("reviews").update(updates).eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Review updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete review" }, { status: 500 });
  }
}
