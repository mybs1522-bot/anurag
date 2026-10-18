import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Ar. Aryan Mehta — Demo Architecture & Interior Studio Initial Data
// ---------------------------------------------------------------------------

const INITIAL_SERVICES = [
  {
    id: "serv-1",
    title: "1-on-1 Architecture & Spatial Planning Call",
    description:
      "Deep-dive 45-minute video consultation to review your plot layout, room zoning, elevation strategy, and architectural feasibility before you hire contractors.",
    category: "CONSULTATION CALL",
    image_url: null,
    amount: 1999,
    currency: "₹",
    payment_link: null,
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "serv-2",
    title: "BOQ & Turnkey Budget Estimation Review",
    description:
      "Itemized Bill of Quantities (BOQ) review. We audit civil, plumbing, electrical, and finishing quotes to eliminate hidden markups and save up to 20% on execution.",
    category: "ESTIMATION & BUDGETING",
    image_url: null,
    amount: 4999,
    currency: "₹",
    payment_link: null,
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "serv-3",
    title: "Comprehensive 2D Floor Plan & Vastu Audit",
    description:
      "Architectural floor plan optimization with furniture layouts, circulation pathways, cross-ventilation analysis, and harmonious Vastu alignment.",
    category: "DESIGN & PLANNING",
    image_url: null,
    amount: 7499,
    currency: "₹",
    payment_link: null,
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "serv-4",
    title: "Complete Luxury Interior Design Concept",
    description:
      "Bespoke moodboards, tactile material palettes (travertine, fluted timber, brass), 3D concept visualizations, and custom joinery design for your home.",
    category: "TURNKEY SOLUTIONS",
    image_url: null,
    amount: 14999,
    currency: "₹",
    payment_link: null,
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_BOOKS = [
  {
    id: "book-1",
    title: "The Modern Indian Home Architecture Handbook",
    thumbnail_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    link: "https://drive.google.com",
    pdf_url: "https://drive.google.com",
    display_order: 1,
    is_active: true,
    price: 99,
    description:
      "A comprehensive 120-page architectural masterclass on designing contemporary homes in India. Covers climate-responsive orientation, passive cooling techniques, spatial ergonomics, and premium material selection without breaking your budget.",
    preview_images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "book-2",
    title: "Turnkey Interior Budgeting Masterclass",
    thumbnail_url:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
    link: "https://drive.google.com",
    pdf_url: "https://drive.google.com",
    display_order: 2,
    is_active: true,
    price: 149,
    description:
      "Everything contractors won't tell you about pricing. Learn how to verify vendor rate cards, structure milestone payments, inspect on-site quality standards, and avoid overpaying for woodwork, false ceilings, and electricals.",
    preview_images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop",
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "book-3",
    title: "Vastu & Contemporary Space Planning",
    thumbnail_url:
      "https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=800&auto=format&fit=crop",
    link: "https://drive.google.com",
    pdf_url: "https://drive.google.com",
    display_order: 3,
    is_active: true,
    price: 79,
    description:
      "Bridging ancient architectural wisdom with modern minimalist aesthetics. Practical, non-dogmatic layouts for living rooms, kitchens, bedrooms, and home offices that promote positive natural energy and daylight flow.",
    preview_images: [
      "https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=800&auto=format&fit=crop",
    ],
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SERVICE_LEADS = [
  {
    id: "lead-1",
    name: "Vikram Singhania",
    phone: "9820112233",
    service_id: "serv-1",
    payment_status: "completed",
    paid_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    lead_status: "Floor Plan",
    appointment_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    appointment_time: "11:00 AM",
    notes_json: JSON.stringify([
      {
        id: "note-1",
        text: "Client building a 5,000 sq.ft villa in Alibaug. Needs layout review and advice on sea-facing elevation windows.",
        createdAt: new Date().toISOString(),
        formattedTime: "Today at 10:30 AM",
        author: "Ar. Aryan Mehta",
      },
    ]),
    money_received: 1999,
    total_invoice: 450000,
    deadline_date: "2026-12-15",
    services: { title: "1-on-1 Architecture & Spatial Planning Call" },
  },
  {
    id: "lead-2",
    name: "Pooja & Rohan Deshmukh",
    phone: "9876543210",
    service_id: "serv-3",
    payment_status: "completed",
    paid_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    lead_status: "3D Design",
    appointment_date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    appointment_time: "03:00 PM",
    notes_json: JSON.stringify([
      {
        id: "note-2",
        text: "4-BHK duplex apartment in Worli. 2D floor plans approved, currently working on 3D visualizations for living and master bedroom.",
        createdAt: new Date().toISOString(),
        formattedTime: "Yesterday at 4:15 PM",
        author: "Ar. Aryan Mehta",
      },
    ]),
    money_received: 7499,
    total_invoice: 850000,
    deadline_date: "2026-11-30",
    services: { title: "Comprehensive 2D Floor Plan & Vastu Audit" },
  },
  {
    id: "lead-3",
    name: "Dr. Anirudh Sen",
    phone: "9988776655",
    service_id: "serv-2",
    payment_status: "completed",
    paid_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    lead_status: "Advance Payment",
    appointment_date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
    appointment_time: "05:00 PM",
    notes_json: JSON.stringify([
      {
        id: "note-3",
        text: "Received contractor BOQ of ₹78 Lakhs for dental clinic + residential penthouse. Auditing civil and HVAC quotes.",
        createdAt: new Date().toISOString(),
        formattedTime: "2 days ago",
        author: "Ar. Aryan Mehta",
      },
    ]),
    money_received: 4999,
    total_invoice: 250000,
    deadline_date: "2026-10-30",
    services: { title: "BOQ & Turnkey Budget Estimation Review" },
  },
  {
    id: "lead-4",
    name: "Meera Nair",
    phone: "9123456789",
    service_id: "serv-4",
    payment_status: "completed",
    paid_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
    lead_status: "Follow Up Again",
    appointment_date: new Date(Date.now() + 345600000).toISOString().split("T")[0],
    appointment_time: "02:00 PM",
    notes_json: JSON.stringify([
      {
        id: "note-4",
        text: "Discussion on turnkey project timeline. Sent moodboard options for Scandinavian Minimalist theme.",
        createdAt: new Date().toISOString(),
        formattedTime: "3 days ago",
        author: "Ar. Aryan Mehta",
      },
    ]),
    money_received: 14999,
    total_invoice: 1200000,
    deadline_date: "2027-01-15",
    services: { title: "Complete Luxury Interior Design Concept" },
  },
];

const INITIAL_BOOK_LEADS = [
  {
    id: "blead-1",
    email: "rohit.architect@gmail.com",
    phone: "9811223344",
    book_id: "book-1",
    payment_status: "completed",
    paid_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "blead-2",
    email: "priya.interiors@outlook.com",
    phone: "9822334455",
    book_id: "book-2",
    payment_status: "completed",
    paid_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

const INITIAL_PROFILE = {
  id: "profile-1",
  displayName: "Ar. Aryan Mehta",
  jobTitle: "Founder & Principal Architect",
  bio: "Principal Architect & Interior Designer",
  avatar: "/images/avatar.jpg",
  flipSentences: [
    "Luxury Residential Architect",
    "Turnkey Interior Designer",
    "Sustainable Space Planner",
    "ArchBIZ & BOQ Consultant",
  ],
  about: `I am Ar. Aryan Mehta, Founder & Principal Architect at **Studio Mehta & Partners**.\n\nWe specialize in bespoke luxury residences, contemporary villas, and end-to-end turnkey interior environments.\n\n**Whether you're planning a new build from ground up, optimizing your floor layout, or need itemized BOQ estimations to prevent costly contractor overcharges, let's connect and craft your space!**`,
  email: "contact@studiomehta.com",
  phone: "+91 98201 12233",
  address: "Mumbai & Bangalore, India",
  website: "https://studiomehta.com",
};

const INITIAL_REVIEWS = [
  {
    id: "r1",
    name: "Aman Singhania",
    role: "Villa Owner, Alibaug",
    content: "The consultation call literally saved us over ₹6 Lakhs! Aryan broke down the actual material rates and itemized BOQ so our contractor couldn't inflate prices.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=AmanSinghania",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "r2",
    name: "Rishi Vardhan",
    role: "Duplex Renovation, Mumbai",
    content: "Loved the direct, transparent approach. No pushing expensive vendor tie-ups, just pure functional design and sustainable material alternatives.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=RishiVardhan",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "r3",
    name: "Shruti & Vikram",
    role: "Penthouse Clients, Pune",
    content: "Aryan gave us exceptional guidelines on selecting contractors and key milestone payment clauses to avoid project delays. Highly recommend him!",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=ShrutiVikram",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "r4",
    name: "Kabir Sen",
    role: "Apartment Buyer, Bangalore",
    content: "Within 20 minutes, Aryan pointed out a massive structural column conflict in our builder's drawing that would have ruined our living room lighting.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=KabirSen",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "r5",
    name: "Tanya Kapoor",
    role: "Homeowner, Gurugram",
    content: "Studio Mehta taught us how to actually audit site work and verify MEP ducting before closing false ceilings. Lifesaver!",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=TanyaKapoor",
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: "r6",
    name: "Sahil Deshmukh",
    role: "Private Residence, Goa",
    content: "Super easy to communicate with. Felt like having a trusted principal architect on speed dial who genuinely cares about your budget.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=SahilDeshmukh",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "r7",
    name: "Meghna Nair",
    role: "Architectural Enthusiast, Kochi",
    content: "No sugarcoating, just real architectural insight on what materials last long in coastal climates. Worth 10x the consultation fee.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=MeghnaNair",
    created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
  {
    id: "r8",
    name: "Ravi Teja",
    role: "Commercial Studio, Hyderabad",
    content: "The BOQ review was immaculate. We caught several redundant items in the HVAC estimate. Absolute game changer.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=RaviTeja",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "r9",
    name: "Dhruv Merchant",
    role: "Townhouse Owner, Ahmedabad",
    content: "We were about to overspend significantly on imported marble. Aryan suggested Indian composite stones that look identical and cost 60% less.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=DhruvMerchant",
    created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
  },
  {
    id: "r10",
    name: "Kritika Malhotra",
    role: "Apartment Renovation, Delhi",
    content: "Clear, direct, and visionary. He re-imagined our master suite layout to incorporate cross ventilation and maximum natural morning light.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=KritikaMalhotra",
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "r11",
    name: "Varun Sharma",
    role: "Self-Builder, Chandigarh",
    content: "Aryan's e-book on turnkey budgeting is gold. We used his contractor evaluation checklist and saved thousands on timber framing.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=VarunSharma",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "r12",
    name: "Simran Johar",
    role: "Interior Client, Mumbai",
    content: "The invoice and estimation templates from Studio Mehta made dealing with vendors 100% dispute-free. Fantastic work!",
    rating: 4,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=SimranJohar",
    created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
  },
  {
    id: "r13",
    name: "Karan Oberoi",
    role: "Farmhouse Owner, Alibaug",
    content: "Unmatched aesthetic sense combined with practical civil engineering knowledge. Highly recommended to anyone building their dream home.",
    rating: 5,
    status: "approved",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=KaranOberoi",
    created_at: new Date(Date.now() - 86400000 * 17).toISOString(),
  },
];

const INITIAL_PROJECT_IMAGES = [
  {
    id: "proj-1",
    category: "Villas",
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "proj-2",
    category: "Villas",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "proj-3",
    category: "Villas",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "proj-4",
    category: "Offices",
    image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "proj-5",
    category: "Offices",
    image_url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "proj-6",
    category: "Living Room",
    image_url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "proj-7",
    category: "Living Room",
    image_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "proj-8",
    category: "Bedroom",
    image_url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "proj-9",
    category: "Bedroom",
    image_url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: "proj-10",
    category: "Kitchen",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "proj-11",
    category: "Washroom",
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
  {
    id: "proj-12",
    category: "Children Room",
    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

// Helper to load/save demo database

function getInitialStore(): Record<string, any[]> {
  return {
    services: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
    books: JSON.parse(JSON.stringify(INITIAL_BOOKS)),
    service_leads: JSON.parse(JSON.stringify(INITIAL_SERVICE_LEADS)),
    book_leads: JSON.parse(JSON.stringify(INITIAL_BOOK_LEADS)),
    reviews: JSON.parse(JSON.stringify(INITIAL_REVIEWS)),
    profile: [JSON.parse(JSON.stringify(INITIAL_PROFILE))],
    project_images: JSON.parse(JSON.stringify(INITIAL_PROJECT_IMAGES)),
  };
}

// In-memory cache for server-side execution
let memoryDb: Record<string, any[]> | null = null;

function getStore(): Record<string, any[]> {
  // If in browser
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("architect_demo_db");
      if (stored) {
        const parsed = JSON.parse(stored);
        let changed = false;
        if (!parsed.project_images || parsed.project_images.length === 0) {
          parsed.project_images = JSON.parse(JSON.stringify(INITIAL_PROJECT_IMAGES));
          changed = true;
        }
        if (!parsed.reviews || !Array.isArray(parsed.reviews) || parsed.reviews.length === 0) {
          parsed.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
          changed = true;
        } else {
          for (const r of parsed.reviews) {
            if (r.avatar_url && r.avatar_url.startsWith("/images/reviews")) {
              r.avatar_url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(r.name || "client")}`;
              changed = true;
            }
          }
        }
        if (changed) {
          window.localStorage.setItem("architect_demo_db", JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    const initial = getInitialStore();
    try {
      window.localStorage.setItem("architect_demo_db", JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  }

  // If in Node.js server
  if (!memoryDb) {
    memoryDb = getInitialStore();
  }
  return memoryDb;
}

function saveStore(store: Record<string, any[]>) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("architect_demo_db", JSON.stringify(store));
    } catch {
      // ignore
    }
    return;
  }

  memoryDb = store;
}

// ---------------------------------------------------------------------------
// Query Builder Mock (Full Supabase Chain Compatibility)
// ---------------------------------------------------------------------------

class MockQueryBuilder {
  private tableName: string;
  private action: "select" | "insert" | "update" | "delete" = "select";
  private filters: Array<{ col: string; op: string; val: any }> = [];
  private orders: Array<{ col: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private rangeBounds: [number, number] | null = null;
  private isSingle = false;
  private payload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns?: string) {
    this.action = "select";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ col: column, op: "eq", val: value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ col: column, op: "neq", val: value });
    return this;
  }

  not(column: string, operator: string, value: any) {
    this.filters.push({ col: column, op: `not_${operator}`, val: value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({
      col: column,
      ascending: options?.ascending !== false,
    });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeBounds = [from, to];
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any) {
    this.action = "insert";
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = "update";
    this.payload = data;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  // Promise resolution
  then(
    onfulfilled?: ((value: { data: any; error: any }) => any) | null,
    onrejected?: ((reason: any) => any) | null
  ): Promise<any> {
    return new Promise<{ data: any; error: any }>((resolve) => {
      const store = getStore();
      if (!store[this.tableName]) {
        store[this.tableName] = [];
      }
      const table = store[this.tableName];

      // 1. INSERT
      if (this.action === "insert") {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted = items.map((item) => ({
          ...item,
          id: item.id || `demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        table.push(...inserted);
        saveStore(store);
        resolve({ data: this.isSingle ? inserted[0] : inserted, error: null });
        return;
      }

      // 2. UPDATE
      if (this.action === "update") {
        const updatedItems: any[] = [];
        for (let i = 0; i < table.length; i++) {
          const row = table[i];
          const matches = this.matchesFilters(row);
          if (matches) {
            table[i] = {
              ...row,
              ...this.payload,
              updated_at: new Date().toISOString(),
            };
            updatedItems.push(table[i]);
          }
        }
        saveStore(store);
        resolve({ data: this.isSingle ? updatedItems[0] : updatedItems, error: null });
        return;
      }

      // 3. DELETE
      if (this.action === "delete") {
        store[this.tableName] = table.filter((row) => !this.matchesFilters(row));
        saveStore(store);
        resolve({ data: null, error: null });
        return;
      }

      // 4. SELECT
      let results = [...table];

      // Apply joins if needed (e.g. services(title) on service_leads)
      if (this.tableName === "service_leads") {
        const servicesList = store["services"] || [];
        results = results.map((lead) => {
          const s = servicesList.find((srv) => srv.id === lead.service_id);
          return {
            ...lead,
            services: s ? { title: s.title } : (lead.services || null),
          };
        });
      }

      // Apply filters
      results = results.filter((row) => this.matchesFilters(row));

      // Apply orders
      for (const ord of this.orders) {
        results.sort((a, b) => {
          const valA = a[ord.col];
          const valB = b[ord.col];
          if (valA === valB) return 0;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (ord.ascending) {
            return valA > valB ? 1 : -1;
          } else {
            return valA < valB ? 1 : -1;
          }
        });
      }

      // Apply range or limit
      if (this.rangeBounds) {
        const [from, to] = this.rangeBounds;
        results = results.slice(from, to + 1);
      } else if (this.limitCount !== null) {
        results = results.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        const item = results[0] || null;
        resolve({
          data: item,
          error: item ? null : { message: "Row not found", code: "PGRST116" },
        });
      } else {
        resolve({ data: results, error: null });
      }
    }).then(onfulfilled, onrejected);
  }

  private matchesFilters(row: any): boolean {
    for (const f of this.filters) {
      const val = row[f.col];
      if (f.op === "eq" && val !== f.val) return false;
      if (f.op === "neq" && val === f.val) return false;
      if (f.op === "not_is" && f.val === null && (val === null || val === undefined)) return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// Supabase Client Mock Object
// ---------------------------------------------------------------------------

function createMockSupabaseClient() {
  return {
    from: (table: string) => new MockQueryBuilder(table),
    storage: {
      from: (bucket: string) => ({
        upload: async (filePath: string, _file: any) => ({
          data: { path: `${bucket}/${filePath}` },
          error: null,
        }),
        getPublicUrl: (filePath: string) => ({
          data: {
            publicUrl: filePath.startsWith("http")
              ? filePath
              : `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop`,
          },
        }),
        remove: async (paths: string[]) => ({
          data: paths,
          error: null,
        }),
      }),
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as unknown as SupabaseClient;
}

// ---------------------------------------------------------------------------
// Supabase Client Export (Auto-detects Real Supabase vs Demo Mock)
// ---------------------------------------------------------------------------

const isRealSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  process.env.NEXT_PUBLIC_DEMO_MODE !== "true";

export const supabase: SupabaseClient = isRealSupabase
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : (createMockSupabaseClient() as unknown as SupabaseClient);

export function getSupabaseAdmin(): SupabaseClient {
  if (isRealSupabase) {
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
  }
  return createMockSupabaseClient() as unknown as SupabaseClient;
}
