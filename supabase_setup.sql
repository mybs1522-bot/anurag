-- ============================================================================
-- MASTER MULTI-TENANT ARCHITECTURE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/iiclvqdzanvphoykyicj/sql/new
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  custom_domain TEXT UNIQUE,
  admin_password TEXT NOT NULL DEFAULT 'demo123',
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  google_calendar_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILE TABLE
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
  cover_position TEXT DEFAULT '50%',
  flip_sentences TEXT[] DEFAULT ARRAY['Luxury Residential Architect', 'Turnkey Interior Designer', 'Sustainable Space Planner', 'ArchBIZ & BOQ Consultant'],
  about TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  google_calendar_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT '₹',
  category TEXT DEFAULT 'CONSULTATION CALL',
  description TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  payment_link TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICE LEADS TABLE
CREATE TABLE IF NOT EXISTS service_leads (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  appointment_date DATE,
  appointment_time TEXT,
  lead_status TEXT DEFAULT 'New',
  money_received NUMERIC DEFAULT 0,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  google_calendar_event_id TEXT,
  notes_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INT DEFAULT 5,
  status TEXT DEFAULT 'approved',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROJECT IMAGES TABLE
CREATE TABLE IF NOT EXISTS project_images (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOKS & E-BOOKS TABLES
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  thumbnail_url TEXT,
  pdf_url TEXT,
  link TEXT,
  preview_images JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_leads (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  payment_status TEXT DEFAULT 'completed',
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_leads_tenant ON service_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tenant ON reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_project_images_tenant ON project_images(tenant_id);
CREATE INDEX IF NOT EXISTS idx_books_tenant ON books(tenant_id);
CREATE INDEX IF NOT EXISTS idx_book_leads_tenant ON book_leads(tenant_id);

-- ============================================================================
-- SEED INITIAL DEMO TENANT & DATA
-- ============================================================================

-- 1. Demo Tenant
INSERT INTO tenants (id, slug, name, custom_domain, admin_password)
VALUES ('tenant_demo', 'demo', 'Ar. Aryan Mehta & Partners', NULL, 'demo123')
ON CONFLICT (id) DO NOTHING;

-- 2. Demo Profile
INSERT INTO profile (id, tenant_id, display_name, job_title, bio, avatar, cover_image, cover_position, flip_sentences, about, email, phone, website)
VALUES (
  'profile_demo',
  'tenant_demo',
  'Ar. Aryan Mehta',
  'Founder & Principal Architect',
  'Luxury Residential Architect & Turnkey Interior Designer',
  '/images/avatar.jpg',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
  '50%',
  ARRAY['Luxury Residential Architect', 'Turnkey Interior Designer', 'Sustainable Space Planner', 'ArchBIZ & BOQ Consultant'],
  'I am Ar. Aryan Mehta, Founder & Principal Architect at **Studio Mehta & Partners**.\n\nWe specialize in bespoke luxury residences, contemporary villas, and end-to-end turnkey interior environments.\n\n**Whether you''re planning a new build from ground up, optimizing your floor layout, or need itemized BOQ estimations to prevent costly contractor overcharges, let''s connect and craft your space!**',
  'contact@studiomehta.com',
  '+91 98201 12233',
  'https://studiomehta.com'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Demo Services
INSERT INTO services (id, tenant_id, title, amount, currency, category, description, display_order, is_active)
VALUES 
  ('serv-1', 'tenant_demo', '1-on-1 Architecture & Spatial Planning Call', 1999, '₹', 'CONSULTATION CALL', 'Deep-dive 45-minute video consultation to review your plot layout, room zoning, elevation strategy, and architectural feasibility before you hire contractors.', 1, true),
  ('serv-2', 'tenant_demo', 'Turnkey Interior Layout & BOQ Rate Audit', 4999, '₹', 'AUDIT & CONSULTING', 'Send us your contractor quotation and floor plan. We will line-item audit the civil, electrical, plumbing, and carpentry rates so you save lakhs on contractor markups.', 2, true),
  ('serv-3', 'tenant_demo', 'Complete Floor Plan & Vastu Alignment Review', 2999, '₹', 'PLANNING CALL', 'Detailed spatial analysis for light, cross-ventilation, and modern non-dogmatic Vastu principles for living rooms, kitchens, master suites, and puja spaces.', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Demo Reviews (13 Client Reviews)
INSERT INTO reviews (id, tenant_id, name, role, content, rating, status, avatar_url)
VALUES 
  ('r1', 'tenant_demo', 'Aman Singhania', 'Villa Owner, Alibaug', 'The consultation call literally saved us over ₹6 Lakhs! Aryan broke down the actual material rates and itemized BOQ so our contractor couldn''t inflate prices.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=AmanSinghania'),
  ('r2', 'tenant_demo', 'Rishi Vardhan', 'Duplex Renovation, Mumbai', 'Loved the direct, transparent approach. No pushing expensive vendor tie-ups, just pure functional design and sustainable material alternatives.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=RishiVardhan'),
  ('r3', 'tenant_demo', 'Shruti & Vikram', 'Penthouse Clients, Pune', 'Aryan gave us exceptional guidelines on selecting contractors and key milestone payment clauses to avoid project delays. Highly recommend him!', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=ShrutiVikram'),
  ('r4', 'tenant_demo', 'Kabir Sen', 'Apartment Buyer, Bangalore', 'Within 20 minutes, Aryan pointed out a massive structural column conflict in our builder''s drawing that would have ruined our living room lighting.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=KabirSen'),
  ('r5', 'tenant_demo', 'Tanya Kapoor', 'Homeowner, Gurugram', 'Studio Mehta taught us how to actually audit site work and verify MEP ducting before closing false ceilings. Lifesaver!', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=TanyaKapoor'),
  ('r6', 'tenant_demo', 'Sahil Deshmukh', 'Private Residence, Goa', 'Super easy to communicate with. Felt like having a trusted principal architect on speed dial who genuinely cares about your budget.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=SahilDeshmukh'),
  ('r7', 'tenant_demo', 'Meghna Nair', 'Architectural Enthusiast, Kochi', 'No sugarcoating, just real architectural insight on what materials last long in coastal climates. Worth 10x the consultation fee.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=MeghnaNair'),
  ('r8', 'tenant_demo', 'Ravi Teja', 'Commercial Studio, Hyderabad', 'The BOQ review was immaculate. We caught several redundant items in the HVAC estimate. Absolute game changer.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=RaviTeja'),
  ('r9', 'tenant_demo', 'Dhruv Merchant', 'Townhouse Owner, Ahmedabad', 'We were about to overspend significantly on imported marble. Aryan suggested Indian composite stones that look identical and cost 60% less.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=DhruvMerchant'),
  ('r10', 'tenant_demo', 'Kritika Malhotra', 'Apartment Renovation, Delhi', 'Clear, direct, and visionary. He re-imagined our master suite layout to incorporate cross ventilation and maximum natural morning light.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=KritikaMalhotra'),
  ('r11', 'tenant_demo', 'Varun Sharma', 'Self-Builder, Chandigarh', 'Aryan''s e-book on turnkey budgeting is gold. We used his contractor evaluation checklist and saved thousands on timber framing.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=VarunSharma'),
  ('r12', 'tenant_demo', 'Simran Johar', 'Interior Client, Mumbai', 'The invoice and estimation templates from Studio Mehta made dealing with vendors 100% dispute-free. Fantastic work!', 4, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=SimranJohar'),
  ('r13', 'tenant_demo', 'Karan Oberoi', 'Farmhouse Owner, Alibaug', 'Unmatched aesthetic sense combined with practical civil engineering knowledge. Highly recommended to anyone building their dream home.', 5, 'approved', 'https://api.dicebear.com/9.x/avataaars/svg?seed=KaranOberoi')
ON CONFLICT (id) DO NOTHING;

-- 5. Demo Project Images (12 Portfolio Photos)
INSERT INTO project_images (id, tenant_id, category, image_url)
VALUES 
  ('proj-1', 'tenant_demo', 'Villas', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop'),
  ('proj-2', 'tenant_demo', 'Villas', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop'),
  ('proj-3', 'tenant_demo', 'Villas', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop'),
  ('proj-4', 'tenant_demo', 'Offices', 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop'),
  ('proj-5', 'tenant_demo', 'Offices', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop'),
  ('proj-6', 'tenant_demo', 'Living Room', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop'),
  ('proj-7', 'tenant_demo', 'Living Room', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop'),
  ('proj-8', 'tenant_demo', 'Bedroom', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1000&auto=format&fit=crop'),
  ('proj-9', 'tenant_demo', 'Bedroom', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop'),
  ('proj-10', 'tenant_demo', 'Kitchen', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop'),
  ('proj-11', 'tenant_demo', 'Washroom', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop'),
  ('proj-12', 'tenant_demo', 'Children Room', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- 6. Demo Books
INSERT INTO books (id, tenant_id, title, price, description, thumbnail_url, display_order, is_active)
VALUES 
  ('book-1', 'tenant_demo', 'The Ultimate Home Builder''s Blueprint', 49, 'The comprehensive zero-fluff manual for first-time homebuilders in India. Covers soil testing, contractor contracts, structural vetting, and step-by-step milestone schedules.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', 1, true),
  ('book-2', 'tenant_demo', 'Contractor Rates & Material Cost Secret Audit', 99, 'Everything contractors won''t tell you about pricing. Learn how to verify vendor rate cards, structure milestone payments, inspect on-site quality standards, and avoid overpaying.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop', 2, true),
  ('book-3', 'tenant_demo', 'Vastu & Contemporary Space Planning', 79, 'Bridging ancient architectural wisdom with modern minimalist aesthetics. Practical, non-dogmatic layouts for living rooms, kitchens, bedrooms, and home offices.', 'https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=800&auto=format&fit=crop', 3, true)
ON CONFLICT (id) DO NOTHING;
