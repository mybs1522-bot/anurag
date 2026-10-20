# 🏛️ Architect Onboarding & Tenant Deployment Playbook

> **Instructions for AI Assistant:**
> When this file or workflow is triggered, automatically execute the end-to-end onboarding workflow for a new architect using the master database credentials below.
> 
> If the user hasn't provided the architect's details yet, ask:
> 1. **Architect / Studio Name** (e.g., `Anurag Mukhopadhyay`)
> 2. **Contact Email** (e.g., `anurag.mukhopadhyay@gmail.com`)
> 3. **Target GitHub Repo URL** (e.g., `https://github.com/mybs1522-bot/anurag`)
> 4. *(Optional)* Phone number and custom slug.
>
> Once provided, perform all steps autonomously without manual intervention.

---

## 1. Master Supabase & Database Environment

Use this exact configuration when initializing `.env.local` for the new deployment:

```env
# -----------------------------------------------------------------------------
# Supabase Configuration (Connected to Master Database)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://iiclvqdzanvphoykyicj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpY2x2cWR6YW52cGhveWt5aWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjQ5NTUsImV4cCI6MjEwNzkwMDk1NX0.EQNQ9WsDw1dJn3pozoZGgPbwGlGsXwpaKJ-5Otn73tg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpY2x2cWR6YW52cGhveWt5aWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjMyNDk1NSwiZXhwIjoyMTA3OTAwOTU1fQ.tb-MJnDMwTOY61sD7A32Dhob03t-x4xWW2RoVl5o0fc

# -----------------------------------------------------------------------------
# Active Architect Tenant Identifier (Dynamically updated per onboarding)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_TENANT_ID=tenant_<clean_slug>

# -----------------------------------------------------------------------------
# Admin & App Settings
# -----------------------------------------------------------------------------
NEXT_PUBLIC_DEMO_MODE=false
ADMIN_PASSWORD=demo123
APP_URL=http://localhost:3000

# -----------------------------------------------------------------------------
# Direct IPv4 Connection Pooler (Used by setup & migration scripts)
# -----------------------------------------------------------------------------
DATABASE_URL=postgresql://postgres.iiclvqdzanvphoykyicj:P6YeT!aT4Q7NMT-@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## 2. Automated Onboarding Steps

### Step 1: Slug Generation & Tenant Identification
- Convert architect name to lowercase slug: e.g. `"Anurag Mukhopadhyay"` ➔ `anurag` (or `anurag-mukhopadhyay`).
- `tenantId` = `tenant_${slug}`.

---

### Step 2: Database Provisioning in Master Supabase
Run the provision script (or insert directly via PostgreSQL / Supabase client):
1. **`tenants` table**:
   - `id`: `tenant_${slug}`
   - `slug`: `${slug}`
   - `name`: `${name}`
   - `admin_password`: `demo123`
2. **`profile` table**:
   - `id`: `profile_${slug}`
   - `tenant_id`: `tenant_${slug}`
   - `display_name`: `${name}`
   - `job_title`: `Principal Architect & Interior Designer`
   - `bio`: `Founder & Principal Architect at ${name}. Bespoke residential architecture and turnkey interior design.`
   - `avatar`: `/images/avatar.jpg`
   - `cover_image`: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop`
   - `flip_sentences`: `['Luxury Residential Architect', 'Turnkey Interior Designer', 'Sustainable Space Planner', 'ArchBIZ & BOQ Consultant']`
   - `about`: Personalized architectural bio introducing `${name}`.
   - `email`: `${email}`
   - `phone`: `${phone}`
3. **`services` table** (3 starter consultation offerings):
   - `serv-1-${slug}`: 1-on-1 Architecture & Spatial Planning Call (₹1,999)
   - `serv-2-${slug}`: Turnkey Interior Layout & BOQ Rate Audit (₹4,999)
   - `serv-3-${slug}`: Complete Floor Plan & Vastu Alignment Review (₹2,999)
4. **`reviews` table**:
   - 3 approved verified client reviews seeded with `tenant_id = tenant_${slug}`.
5. **`project_images` table**:
   - 12 curated architecture showcase photos (Villas, Offices, Living Rooms, Bedrooms) with `tenant_id = tenant_${slug}`.
6. **`books` table**:
   - 3 starter architectural blueprints and guides with preview pages seeded with `tenant_id = tenant_${slug}`.

---

### Step 3: Enforce Strict Tenant Isolation in Code
Ensure all data access points filter strictly by `tenant_id`:

1. **Frontend Sections**:
   - `src/features/profile/components/services/index.tsx`:
     `.from("services").select("*").eq("tenant_id", tenantId).eq("is_active", true)`
   - `src/features/profile/components/reviews/index.tsx`:
     `.from("reviews").select("*").eq("tenant_id", tenantId).eq("status", "approved")`
   - `src/features/profile/components/projects/index.tsx`:
     `.from("project_images").select("*").eq("tenant_id", tenantId)`
   - `src/features/books/components/books-section.tsx`:
     `.from("books").select("*").eq("tenant_id", tenantId).eq("is_active", true)`
   - `src/features/profile/components/quick-actions.tsx`:
     `.from("services").select("*").eq("tenant_id", tenantId).eq("is_active", true)`

2. **Lead Captures & Inserts**:
   - `src/features/profile/components/services/service-dialog.tsx`:
     Ensure `tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "tenant_${slug}"` is passed into `service_leads` insertion.
   - `src/features/books/components/book-dialog.tsx`:
     Ensure `tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "tenant_${slug}"` is passed into `book_leads` insertion.
   - `src/app/books/[id]/page.tsx`:
     Ensure `tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "tenant_${slug}"` is passed into `book_leads` insertion.

3. **Admin Dashboard Tabs**:
   - `src/app/admin/components/books-tab.tsx`: Filter books and book sales by `tenant_id`. Declare `tenant_id` directly inside `payload` definition to maintain TypeScript type safety.
   - `src/app/admin/components/projects-tab.tsx`: Filter and insert project images with `tenant_id`.
   - `src/app/admin/components/leads-tab.tsx`: Filter book leads by `tenant_id`.
   - `src/app/admin/components/service-leads-tab.tsx`: Filter consultation leads by `tenant_id`.
   - `src/app/admin/components/invoice-generator-tab.tsx`: Filter invoice client leads by `tenant_id`.

4. **Admin API Routes**:
   - `src/app/api/admin/services/route.ts`: Scope both services query and lead stats by `tenant_id`.
   - `src/app/api/admin/reviews/route.ts`: Filter reviews by `tenant_id`.
   - `src/app/api/admin/calendar/route.ts`: Filter calendar slots and blocked dates by `tenant_id`.

---

### Step 4: Hide Multi-Tenant Directory from the Architect
An onboarded architect must **only see their own studio dashboard**:
- Ensure `src/app/admin/page.tsx` **does NOT include the "Tenants" tab**.
- Delete or do not expose `src/app/admin/components/tenants-tab.tsx` and `src/app/api/admin/tenants`.
- The architect's dashboard will display only:
  - **Profile**
  - **Service Leads**
  - **Calendar**
  - **Services**
  - **Invoices**
  - **E-Books**
  - **Book Sales**
  - **Reviews**
  - **Projects**

---

### Step 5: Update Static / SSR Branding Fallback
Update `src/data/user.ts` with the architect's information (`displayName`, `bio`, `about`, `email`) so static pre-rendering and metadata match the architect before database hydration.

---

### Step 6: "Built by Connect" Branding & Turbopack Configuration
1. **Connect Logos**:
   - `public/images/connect-logo-light.png` (dark logo for light mode)
   - `public/images/connect-logo-dark.png` (white logo for dark mode)
2. **Main Footer (`src/components/footer.tsx`) & Admin Footer (`src/app/admin/layout.tsx`)**:
   Include subtle, impactful "Built by [Connect logo]" component toggling between light and dark versions, with clean copyright (e.g. `© {new Date().getFullYear()} <Name/Initials>`) and email only (no refund policy):
   ```tsx
   <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 font-mono text-xs text-muted-foreground">
     <div>
       <span>© {new Date().getFullYear()} Anurag M</span>
     </div>

     {/* Built by Connect */}
     <div className="flex items-center gap-1.5 font-sans transition-opacity hover:opacity-100 opacity-90">
       <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80">Built by</span>
       <span className="inline-flex items-center">
         <Image src="/images/connect-logo-light.png" alt="Connect" width={75} height={25} className="h-[15px] w-auto dark:hidden object-contain" priority />
         <Image src="/images/connect-logo-dark.png" alt="Connect" width={75} height={25} className="h-[15px] w-auto hidden dark:inline-block object-contain" priority />
       </span>
     </div>

     <div>
       <a href={`mailto:${email}`} className="transition-colors hover:text-foreground">{email}</a>
     </div>
   </div>
   ```
3. **Next.js Turbopack Optimization (`next.config.ts`)**:
   Include `serverExternalPackages: ["googleapis"]` in `nextConfig` to avoid CommonJS Turbopack tracing issues.

---

### Step 7: Verification & Git Push
1. Run `pnpm exec tsc --noEmit` to verify 0 TypeScript compilation errors.
2. Run `pnpm build` to confirm static and server route generation passes.
3. Push to the target repository:
   ```bash
   git remote add target <TARGET_GITHUB_REPO_URL>
   git push -u target main
   ```
4. Verify deployment on Vercel with environment variables set from Section 1.
