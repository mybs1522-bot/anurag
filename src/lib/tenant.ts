import { getSupabaseAdmin } from "./supabase";

export interface TenantData {
  id: string;
  slug: string;
  name: string;
  custom_domain?: string | null;
  admin_password?: string;
  razorpay_key_id?: string | null;
  razorpay_key_secret?: string | null;
  google_calendar_id?: string | null;
  created_at?: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  displayName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  bio?: string;
  adminPassword?: string;
  customDomain?: string;
  googleCalendarId?: string;
}

/**
 * Returns active tenant ID from environment or fallback
 */
export function getActiveTenantId(): string {
  return process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag";
}

/**
 * Lists all registered tenants
 */
export async function listTenants(): Promise<TenantData[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tenants:", error);
    return [];
  }
  return data || [];
}

/**
 * Creates a brand new tenant with complete starter data (profile, services, reviews, categories)
 */
export async function createNewTenant(input: CreateTenantInput) {
  const supabase = getSupabaseAdmin();
  const cleanSlug = input.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
  const tenantId = `tenant_${cleanSlug}`;

  // 1. Create tenant row
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .insert([
      {
        id: tenantId,
        slug: cleanSlug,
        name: input.name.trim(),
        custom_domain: input.customDomain?.trim() || null,
        admin_password: input.adminPassword || "admin123",
        google_calendar_id: input.googleCalendarId?.trim() || null,
      },
    ])
    .select()
    .single();

  if (tErr) {
    throw new Error(`Failed to create tenant: ${tErr.message}`);
  }

  // 2. Create profile
  const displayName = input.displayName?.trim() || input.name.trim();
  const jobTitle = input.jobTitle?.trim() || "Principal Architect & Interior Designer";
  const bio =
    input.bio?.trim() ||
    `Founder & Principal Architect at ${input.name.trim()}. Bespoke residential and turnkey interior design.`;

  const about = `I am ${displayName}, Founder & Principal Architect at **${input.name.trim()}**.\n\nWe specialize in bespoke luxury residences, contemporary villas, and end-to-end turnkey interior environments.\n\n**Whether you're planning a new build from ground up, optimizing your floor layout, or need itemized BOQ estimations to prevent costly contractor overcharges, let's connect and craft your space!**`;

  await supabase.from("profile").insert([
    {
      id: `profile_${cleanSlug}`,
      tenant_id: tenantId,
      display_name: displayName,
      job_title: jobTitle,
      bio,
      avatar: "/images/avatar.jpg",
      about,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      google_calendar_id: input.googleCalendarId?.trim() || null,
    },
  ]);

  // 3. Seed starter consultation services
  await supabase.from("services").insert([
    {
      id: `serv-1-${cleanSlug}`,
      tenant_id: tenantId,
      title: "1-on-1 Architecture & Spatial Planning Call",
      amount: 1999,
      currency: "₹",
      category: "CONSULTATION CALL",
      description:
        "Deep-dive 45-minute video consultation to review your plot layout, room zoning, elevation strategy, and architectural feasibility before you hire contractors.",
      display_order: 1,
      is_active: true,
    },
    {
      id: `serv-2-${cleanSlug}`,
      tenant_id: tenantId,
      title: "Turnkey Interior Layout & BOQ Rate Audit",
      amount: 4999,
      currency: "₹",
      category: "AUDIT & CONSULTING",
      description:
        "Send us your contractor quotation and floor plan. We will line-item audit the civil, electrical, plumbing, and carpentry rates so you save lakhs on contractor markups.",
      display_order: 2,
      is_active: true,
    },
    {
      id: `serv-3-${cleanSlug}`,
      tenant_id: tenantId,
      title: "Complete Floor Plan & Vastu Alignment Review",
      amount: 2999,
      currency: "₹",
      category: "PLANNING CALL",
      description:
        "Detailed spatial analysis for light, cross-ventilation, and modern non-dogmatic Vastu principles for living rooms, kitchens, master suites, and puja spaces.",
      display_order: 3,
      is_active: true,
    },
  ]);

  // 4. Seed starter reviews
  await supabase.from("reviews").insert([
    {
      id: `r1-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Aman Singhania",
      role: "Villa Owner",
      content:
        "The consultation call saved us over ₹6 Lakhs! Broken down actual material rates and itemized BOQ so contractors couldn't inflate prices.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=AmanSinghania`,
    },
    {
      id: `r2-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Rishi Vardhan",
      role: "Duplex Renovation",
      content:
        "Loved the direct, transparent approach. No pushing expensive vendor tie-ups, just pure functional design and sustainable material alternatives.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=RishiVardhan`,
    },
    {
      id: `r3-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Shruti & Vikram",
      role: "Penthouse Clients",
      content:
        "Exceptional guidelines on selecting contractors and key milestone payment clauses to avoid project delays. Highly recommended!",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=ShrutiVikram`,
    },
  ]);

  return {
    success: true,
    tenantId,
    slug: cleanSlug,
    name: input.name,
    adminPassword: input.adminPassword || "admin123",
  };
}
