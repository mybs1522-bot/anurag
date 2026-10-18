import { NextRequest, NextResponse } from "next/server";
import { listTenants, createNewTenant } from "@/lib/tenant";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const tenants = await listTenants();
    const supabase = getSupabaseAdmin();

    // Fetch summary stats for each tenant
    const enrichedTenants = await Promise.all(
      tenants.map(async (t) => {
        const [profRes, leadsRes, servRes] = await Promise.all([
          supabase.from("profile").select("display_name, email, phone, job_title").eq("tenant_id", t.id).single(),
          supabase.from("service_leads").select("id", { count: "exact" }).eq("tenant_id", t.id),
          supabase.from("services").select("id", { count: "exact" }).eq("tenant_id", t.id),
        ]);

        return {
          ...t,
          profile: profRes.data || null,
          leadsCount: leadsRes.data?.length || 0,
          servicesCount: servRes.data?.length || 0,
        };
      })
    );

    return NextResponse.json({ tenants: enrichedTenants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list tenants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, email, phone, displayName, jobTitle, bio, adminPassword, customDomain, googleCalendarId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Studio/Architect Name and URL slug are required" }, { status: 400 });
    }

    const result = await createNewTenant({
      name,
      slug,
      email,
      phone,
      displayName,
      jobTitle,
      bio,
      adminPassword,
      customDomain,
      googleCalendarId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create tenant" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    if (id === "tenant_demo") {
      return NextResponse.json({ error: "Cannot delete the default demo tenant" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("tenants").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Tenant deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete tenant" }, { status: 500 });
  }
}
