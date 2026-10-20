const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Supabase credentials missing from .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Parse CLI args
const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    params[key] = val;
  }
}

function prompt(rl, question, defaultVal = '') {
  return new Promise(resolve => {
    rl.question(`${question}${defaultVal ? ` [${defaultVal}]` : ''}: `, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('🏛️  MASTER PROJECT: CREATE NEW ARCHITECT / TENANT');
  console.log('======================================================\n');

  let name = params.name;
  let slug = params.slug;
  let email = params.email;
  let phone = params.phone;
  let password = params.password || 'admin123';
  let googleCalendarId = params.calendar;

  if (!name || !slug) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (!name) name = await prompt(rl, 'Architect or Studio Name (e.g. Ar. Priya Sen & Partners)');
    if (!slug) slug = await prompt(rl, 'URL Slug / Short ID (e.g. priya, modern-villas)', name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15));
    if (!email) email = await prompt(rl, 'Contact Email', 'contact@' + slug + '.com');
    if (!phone) phone = await prompt(rl, 'Phone Number', '+91 98765 43210');
    if (!password) password = await prompt(rl, 'Admin Password', 'admin123');
    if (!googleCalendarId) googleCalendarId = await prompt(rl, 'Google Calendar ID (optional, press Enter to skip)', '');

    rl.close();
  }

  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
  const tenantId = `tenant_${cleanSlug}`;

  console.log(`\n⏳ Provisioning tenant "${name}" (${tenantId}) in Supabase...`);

  // 1. Check existing
  const { data: existing } = await supabase.from('tenants').select('id').eq('id', tenantId).single();
  if (existing) {
    console.error(`❌ Tenant with ID "${tenantId}" already exists!`);
    process.exit(1);
  }

  // 2. Insert tenant
  const { error: tErr } = await supabase.from('tenants').insert([
    {
      id: tenantId,
      slug: cleanSlug,
      name: name.trim(),
      admin_password: password,
      google_calendar_id: googleCalendarId || null
    }
  ]);

  if (tErr) {
    console.error('❌ Error creating tenant in Supabase:', tErr.message);
    process.exit(1);
  }

  // 3. Insert profile
  const aboutText = `I am ${name}, Founder & Principal Architect.\n\nWe specialize in bespoke luxury residences, contemporary villas, and end-to-end turnkey interior environments.\n\n**Whether you're planning a new build from ground up, optimizing your floor layout, or need itemized BOQ estimations to prevent costly contractor overcharges, let's connect and craft your space!**`;

  await supabase.from('profile').insert([
    {
      id: `profile_${cleanSlug}`,
      tenant_id: tenantId,
      display_name: name.trim(),
      job_title: 'Principal Architect & Interior Designer',
      bio: `Founder & Principal Architect at ${name.trim()}. Bespoke residential architecture and turnkey interior design.`,
      avatar: '/images/avatar.jpg',
      cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
      cover_position: '50%',
      flip_sentences: [
        'Luxury Residential Architect',
        'Turnkey Interior Designer',
        'Sustainable Space Planner',
        'ArchBIZ & BOQ Consultant'
      ],
      about: aboutText,
      email: email || null,
      phone: phone || null,
      google_calendar_id: googleCalendarId || null
    }
  ]);

  // 4. Seed services
  await supabase.from('services').insert([
    {
      id: `serv-1-${cleanSlug}`,
      tenant_id: tenantId,
      title: '1-on-1 Architecture & Spatial Planning Call',
      amount: 1999,
      currency: '₹',
      category: 'CONSULTATION CALL',
      description: 'Deep-dive 45-minute video consultation to review your plot layout, room zoning, elevation strategy, and architectural feasibility before you hire contractors.',
      display_order: 1,
      is_active: true
    },
    {
      id: `serv-2-${cleanSlug}`,
      tenant_id: tenantId,
      title: 'Turnkey Interior Layout & BOQ Rate Audit',
      amount: 4999,
      currency: '₹',
      category: 'AUDIT & CONSULTING',
      description: 'Send us your contractor quotation and floor plan. We will line-item audit the civil, electrical, plumbing, and carpentry rates so you save lakhs on contractor markups.',
      display_order: 2,
      is_active: true
    },
    {
      id: `serv-3-${cleanSlug}`,
      tenant_id: tenantId,
      title: 'Complete Floor Plan & Vastu Alignment Review',
      amount: 2999,
      currency: '₹',
      category: 'PLANNING CALL',
      description: 'Detailed spatial analysis for light, cross-ventilation, and modern non-dogmatic Vastu principles for living rooms, kitchens, master suites, and puja spaces.',
      display_order: 3,
      is_active: true
    }
  ]);

  // 5. Seed reviews (14 curated verified reviews)
  await supabase.from('reviews').insert([
    {
      id: `r1-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Aman Singhania',
      role: 'Villa Owner, Alibaug',
      content: 'The consultation literally saved us ₹8.5 Lakhs. He line-item audited our contractor\'s civil & electrical BOQ and revealed absurd 40% rate inflations. His honesty in an industry full of hidden vendor commissions is extraordinarily rare.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=AmanSinghania`
    },
    {
      id: `r2-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Rishi Vardhan',
      role: 'Duplex Renovation, Mumbai',
      content: 'What sets this studio apart is unflinching integrity. While previous designers pushed exorbitant Italian marble tie-ups for fat cuts, he honestly recommended durable Indian composites that looked identical at one-third the price.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=RishiVardhan`
    },
    {
      id: `r3-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Shruti & Vikram Malhotra',
      role: 'Penthouse Owners, Bangalore',
      content: 'Supreme professionalism from day one. Delivered working structural and lighting drawings right on schedule and structured our vendor contracts with strict milestone-based escrow terms so we never risked a delay.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=ShrutiVikram`
    },
    {
      id: `r4-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Dr. Arindam Sen',
      role: 'Bespoke Residence, Kolkata',
      content: 'Finding an architect who combines visionary spatial design with crystal-clear financial honesty is next to impossible. He treated our construction budget like his own hard-earned money. Not a single hidden fee.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=ArindamSen`
    },
    {
      id: `r5-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Tanya Kapoor',
      role: 'Independent Villa, Gurugram',
      content: 'Spotted a major structural column and HVAC duct clash in our builder\'s drawing within 30 minutes of our call. His technical depth and disciplined site review protocols prevented a catastrophic layout mistake.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=TanyaKapoor`
    },
    {
      id: `r6-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Sahil & Neha Deshmukh',
      role: 'Holiday Home, North Goa',
      content: 'Working with the team has been a masterclass in architectural ethics. Spent hours explaining coastal weathering, lime plaster, and sustainable timber without ever overcharging for revisions. Truly an architect of integrity.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=SahilDeshmukh`
    },
    {
      id: `r7-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Meghna Nair',
      role: 'Commercial Studio, Kochi',
      content: 'Zero fluff, no pretension, just razor-sharp architectural clarity. The spatial planning gave our 2,400 sq.ft floor plate the feel of a 4,000 sq.ft gallery. His punctuality and calm demeanour made the whole process effortless.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=MeghnaNair`
    },
    {
      id: `r8-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Ravi Teja Varma',
      role: 'Luxury Penthouse, Hyderabad',
      content: 'Our contractor attempted to submit inflated variations mid-project. The architect stepped in, reviewed the technical specs clause by clause, and held them strictly to the agreed BOQ rate. Fiercely protective of his clients.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=RaviTeja`
    },
    {
      id: `r9-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Kritika & Sameer Mehta',
      role: 'Heritage Home Restoration, Pune',
      content: 'Honesty is his greatest superpower. He openly told us which expensive civil modifications were completely unnecessary, saving us months of demolition noise and over ₹5 Lakhs in wasteful expenditure.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=KritikaMehta`
    },
    {
      id: `r10-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Dhruv Merchant',
      role: 'Modern Villa, Ahmedabad',
      content: 'Command over natural lighting, thermal comfort, and passive cross-ventilation is exceptional. Our energy footprint is down 30% thanks to window orientation strategies. A consummate professional.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=DhruvMerchant`
    },
    {
      id: `r11-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Varun Sharma',
      role: 'Turnkey Residence, Chandigarh',
      content: 'The level of transparency brought to material procurement is unmatched. He provided direct wholesale supplier bills with zero markup. In 15 years of building properties, I have never seen this level of honesty.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=VarunSharma`
    },
    {
      id: `r12-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Simran & Jasmeet Johar',
      role: 'Apartment Interior, Delhi NCR',
      content: 'The design sensibility is understated luxury at its finest. Respected our lifestyle, designed bespoke storage that didn\'t clutter sightlines, and kept communication transparent across every milestone.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=SimranJohar`
    },
    {
      id: `r13-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Karan Oberoi',
      role: 'Bespoke Farmhouse, Chattarpur',
      content: 'From site zoning to contractor handover, punctual, thorough, and completely dependable. Working drawings were flawless, and weekly supervision logs kept the construction crew on their toes.',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=KaranOberoi`
    },
    {
      id: `r14-${cleanSlug}`,
      tenant_id: tenantId,
      name: 'Ananya Roy',
      role: 'Lakefront Bungalow, Udaipur',
      content: 'Not just a brilliant architect; a trusted advisor of absolute integrity. Candid feedback on what will actually work versus what looks good only on Instagram saved us countless headaches. Outstanding work!',
      rating: 5,
      status: 'approved',
      avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=AnanyaRoy`
    }
  ]);

  console.log('\n🎉 SUCCESS! New Tenant Provisioned in Supabase:\n');
  console.log(`  • Tenant ID:       ${tenantId}`);
  console.log(`  • Studio / Name:   ${name}`);
  console.log(`  • Slug:            ${cleanSlug}`);
  console.log(`  • Admin Password:  ${password}`);
  console.log(`  • Email:           ${email}`);
  console.log(`  • Phone:           ${phone}`);
  console.log('\n------------------------------------------------------');
  console.log('🚀 HOW TO USE THIS TENANT:');
  console.log('1. Standalone deployment on Vercel:');
  console.log(`   Set NEXT_PUBLIC_TENANT_ID=${tenantId} in Vercel environment variables.`);
  console.log('2. Admin Dashboard Login:');
  console.log(`   Log in at /admin using password: ${password}`);
  console.log('------------------------------------------------------\n');
}

run();
