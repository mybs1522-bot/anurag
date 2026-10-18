const dayjs = require('dayjs');
const { getDbClient } = require('./get_db_client');

async function seed() {
  const client = getDbClient();

  await client.connect();
  console.log('Connected to Supabase Postgres!');

  // Ensure total_invoice and deadline_date columns exist
  await client.query(`
    ALTER TABLE service_leads ADD COLUMN IF NOT EXISTS total_invoice NUMERIC DEFAULT 0;
    ALTER TABLE service_leads ADD COLUMN IF NOT EXISTS deadline_date DATE;
  `);
  console.log('Verified service_leads columns.');

  // Clear existing demo leads if any
  await client.query(`DELETE FROM service_leads WHERE tenant_id = 'tenant_demo';`);
  await client.query(`DELETE FROM book_leads WHERE tenant_id = 'tenant_demo';`);

  const now = new Date();

  // 1. Seed Service Leads
  const serviceLeads = [
    {
      id: 'slead-1',
      tenant_id: 'tenant_demo',
      name: 'Vikram Singhania',
      phone: '+91 98201 12233',
      service_id: 'serv-1',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      appointment_time: '11:00 AM',
      lead_status: 'Floor Plan',
      money_received: 1999,
      total_invoice: 450000,
      deadline_date: '2026-12-15',
      notes_json: JSON.stringify([
        {
          id: 'note-1',
          text: 'Client building a 5,000 sq.ft sea-facing luxury villa in Alibaug. Reviewed plot layout, room zoning, and advised on cantilevered sea-facing elevation windows.',
          createdAt: new Date().toISOString(),
          formattedTime: 'Today at 10:30 AM',
          author: 'Ar. Aryan Mehta'
        }
      ]),
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'slead-2',
      tenant_id: 'tenant_demo',
      name: 'Pooja & Rohan Deshmukh',
      phone: '+91 98765 43210',
      service_id: 'serv-3',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 86400000).toISOString(),
      appointment_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      appointment_time: '03:00 PM',
      lead_status: '3D Design',
      money_received: 7499,
      total_invoice: 850000,
      deadline_date: '2026-11-30',
      notes_json: JSON.stringify([
        {
          id: 'note-2',
          text: '4-BHK duplex apartment in Worli, Mumbai. 2D floor plans approved with harmonious Vastu alignment. Currently finalizing 3D photorealistic visualizations for master suite and living room.',
          createdAt: new Date().toISOString(),
          formattedTime: 'Yesterday at 4:15 PM',
          author: 'Ar. Aryan Mehta'
        }
      ]),
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'slead-3',
      tenant_id: 'tenant_demo',
      name: 'Dr. Anirudh Sen',
      phone: '+91 99887 76655',
      service_id: 'serv-2',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 172800000).toISOString(),
      appointment_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      appointment_time: '05:00 PM',
      lead_status: 'Advance Payment',
      money_received: 4999,
      total_invoice: 250000,
      deadline_date: '2026-10-30',
      notes_json: JSON.stringify([
        {
          id: 'note-3',
          text: 'Received contractor BOQ quotation of ₹78 Lakhs for dental clinic + penthouse in Pune. Auditing civil, HVAC, and Italian marble rate cards to eliminate contractor markup.',
          createdAt: new Date().toISOString(),
          formattedTime: '2 days ago',
          author: 'Ar. Aryan Mehta'
        }
      ]),
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'slead-4',
      tenant_id: 'tenant_demo',
      name: 'Meera Nair',
      phone: '+91 91234 56789',
      service_id: 'serv-1',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 259200000).toISOString(),
      appointment_date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
      appointment_time: '02:00 PM',
      lead_status: 'Follow Up Again',
      money_received: 14999,
      total_invoice: 1200000,
      deadline_date: '2027-01-15',
      notes_json: JSON.stringify([
        {
          id: 'note-4',
          text: 'Turnkey luxury interior for penthouse in Bangalore. Scandinavian minimalist aesthetic with fluted oak timber and travertine accents. Sent revised moodboard.',
          createdAt: new Date().toISOString(),
          formattedTime: '3 days ago',
          author: 'Ar. Aryan Mehta'
        }
      ]),
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 'slead-5',
      tenant_id: 'tenant_demo',
      name: 'Harshvardhan Kapoor',
      phone: '+91 98112 24466',
      service_id: 'serv-2',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 345600000).toISOString(),
      appointment_date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
      appointment_time: '12:30 PM',
      lead_status: 'Floor Plan',
      money_received: 4999,
      total_invoice: 620000,
      deadline_date: '2026-12-20',
      notes_json: JSON.stringify([
        {
          id: 'note-5',
          text: 'Farmhouse project in Chattarpur, Delhi. Finalizing structural column spans and cantilevered patio roof with local contractor.',
          createdAt: new Date().toISOString(),
          formattedTime: '4 days ago',
          author: 'Ar. Aryan Mehta'
        }
      ]),
      created_at: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: 'slead-6',
      tenant_id: 'tenant_demo',
      name: 'Ananya & Siddharth Roy',
      phone: '+91 98334 45566',
      service_id: 'serv-3',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 604800000).toISOString(),
      appointment_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      appointment_time: '04:00 PM',
      lead_status: 'Closed',
      money_received: 950000,
      total_invoice: 950000,
      deadline_date: '2026-09-30',
      notes_json: JSON.stringify([
        {
          id: 'note-6',
          text: 'Turnkey residential apartment hand-over completed in Bandra West, Mumbai. Client gave a 5-star review and signed ongoing maintenance contract.',
          createdAt: new Date().toISOString(),
          formattedTime: '1 week ago',
          author: 'Ar. Aryan Mehta'
        }
      ]),
      created_at: new Date(Date.now() - 604800000).toISOString()
    }
  ];

  for (const lead of serviceLeads) {
    await client.query(
      `INSERT INTO service_leads (
        id, tenant_id, name, phone, service_id, payment_status, paid_at,
        appointment_date, appointment_time, lead_status, money_received,
        total_invoice, deadline_date, notes_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        lead.id, lead.tenant_id, lead.name, lead.phone, lead.service_id,
        lead.payment_status, lead.paid_at, lead.appointment_date,
        lead.appointment_time, lead.lead_status, lead.money_received,
        lead.total_invoice, lead.deadline_date, lead.notes_json, lead.created_at
      ]
    );
  }
  console.log(`✅ Seeded ${serviceLeads.length} Service Leads!`);

  // 2. Seed Book Sales (book_leads)
  const bookSales = [
    {
      id: 'bsale-1',
      tenant_id: 'tenant_demo',
      email: 'rohit.architect@gmail.com',
      phone: '+91 98112 23344',
      book_id: 'book-1',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'bsale-2',
      tenant_id: 'tenant_demo',
      email: 'priya.interiors@outlook.com',
      phone: '+91 98223 34455',
      book_id: 'book-2',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'bsale-3',
      tenant_id: 'tenant_demo',
      email: 'karan.builder@gmail.com',
      phone: '+91 98334 45566',
      book_id: 'book-3',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'bsale-4',
      tenant_id: 'tenant_demo',
      email: 'divya.sharma@yahoo.in',
      phone: '+91 98445 56677',
      book_id: 'book-1',
      payment_status: 'completed',
      paid_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  for (const b of bookSales) {
    await client.query(
      `INSERT INTO book_leads (id, tenant_id, email, phone, book_id, payment_status, paid_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [b.id, b.tenant_id, b.email, b.phone, b.book_id, b.payment_status, b.paid_at, b.created_at]
    );
  }
  console.log(`✅ Seeded ${bookSales.length} Book Sales!`);

  await client.end();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
