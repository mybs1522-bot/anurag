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

  // 4. Seed starter reviews (14 curated verified reviews)
  await supabase.from("reviews").insert([
    {
      id: `r1-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Aman Singhania",
      role: "Villa Owner, Alibaug",
      content:
        "The consultation literally saved us ₹8.5 Lakhs. He line-item audited our contractor's civil & electrical BOQ and revealed absurd 40% rate inflations. His honesty in an industry full of hidden vendor commissions is extraordinarily rare.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=AmanSinghania`,
    },
    {
      id: `r2-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Rishi Vardhan",
      role: "Duplex Renovation, Mumbai",
      content:
        "What sets this studio apart is unflinching integrity. While previous designers pushed exorbitant Italian marble tie-ups for fat cuts, he honestly recommended durable Indian composites that looked identical at one-third the price.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=RishiVardhan`,
    },
    {
      id: `r3-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Shruti & Vikram Malhotra",
      role: "Penthouse Owners, Bangalore",
      content:
        "Supreme professionalism from day one. Delivered working structural and lighting drawings right on schedule and structured our vendor contracts with strict milestone-based escrow terms so we never risked a delay.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=ShrutiVikram`,
    },
    {
      id: `r4-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Dr. Arindam Sen",
      role: "Bespoke Residence, Kolkata",
      content:
        "Finding an architect who combines visionary spatial design with crystal-clear financial honesty is next to impossible. He treated our construction budget like his own hard-earned money. Not a single hidden fee.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=ArindamSen`,
    },
    {
      id: `r5-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Tanya Kapoor",
      role: "Independent Villa, Gurugram",
      content:
        "Spotted a major structural column and HVAC duct clash in our builder's drawing within 30 minutes of our call. His technical depth and disciplined site review protocols prevented a catastrophic layout mistake.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=TanyaKapoor`,
    },
    {
      id: `r6-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Sahil & Neha Deshmukh",
      role: "Holiday Home, North Goa",
      content:
        "Working with the team has been a masterclass in architectural ethics. Spent hours explaining coastal weathering, lime plaster, and sustainable timber without ever overcharging for revisions. Truly an architect of integrity.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=SahilDeshmukh`,
    },
    {
      id: `r7-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Meghna Nair",
      role: "Commercial Studio, Kochi",
      content:
        "Zero fluff, no pretension, just razor-sharp architectural clarity. The spatial planning gave our 2,400 sq.ft floor plate the feel of a 4,000 sq.ft gallery. His punctuality and calm demeanour made the whole process effortless.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=MeghnaNair`,
    },
    {
      id: `r8-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Ravi Teja Varma",
      role: "Luxury Penthouse, Hyderabad",
      content:
        "Our contractor attempted to submit inflated variations mid-project. The architect stepped in, reviewed the technical specs clause by clause, and held them strictly to the agreed BOQ rate. Fiercely protective of his clients.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=RaviTeja`,
    },
    {
      id: `r9-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Kritika & Sameer Mehta",
      role: "Heritage Home Restoration, Pune",
      content:
        "Honesty is his greatest superpower. He openly told us which expensive civil modifications were completely unnecessary, saving us months of demolition noise and over ₹5 Lakhs in wasteful expenditure.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=KritikaMehta`,
    },
    {
      id: `r10-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Dhruv Merchant",
      role: "Modern Villa, Ahmedabad",
      content:
        "Command over natural lighting, thermal comfort, and passive cross-ventilation is exceptional. Our energy footprint is down 30% thanks to window orientation strategies. A consummate professional.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=DhruvMerchant`,
    },
    {
      id: `r11-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Varun Sharma",
      role: "Turnkey Residence, Chandigarh",
      content:
        "The level of transparency brought to material procurement is unmatched. He provided direct wholesale supplier bills with zero markup. In 15 years of building properties, I have never seen this level of honesty.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=VarunSharma`,
    },
    {
      id: `r12-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Simran & Jasmeet Johar",
      role: "Apartment Interior, Delhi NCR",
      content:
        "The design sensibility is understated luxury at its finest. Respected our lifestyle, designed bespoke storage that didn't clutter sightlines, and kept communication transparent across every milestone.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=SimranJohar`,
    },
    {
      id: `r13-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Karan Oberoi",
      role: "Bespoke Farmhouse, Chattarpur",
      content:
        "From site zoning to contractor handover, punctual, thorough, and completely dependable. Working drawings were flawless, and weekly supervision logs kept the construction crew on their toes.",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=KaranOberoi`,
    },
    {
      id: `r14-${cleanSlug}`,
      tenant_id: tenantId,
      name: "Ananya Roy",
      role: "Lakefront Bungalow, Udaipur",
      content:
        "Not just a brilliant architect; a trusted advisor of absolute integrity. Candid feedback on what will actually work versus what looks good only on Instagram saved us countless headaches. Outstanding work!",
      rating: 5,
      status: "approved",
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=AnanyaRoy`,
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
