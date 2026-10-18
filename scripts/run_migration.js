const fs = require('fs');
const path = require('path');
const { getDbClient } = require('./get_db_client');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'supabase_setup.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Connecting to Supabase via IPv4 Pooler (Session Mode)...');
  const client = getDbClient();

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase Postgres (Session Pooler)!');

    console.log('Executing supabase_setup.sql schema and seed migration...');
    await client.query(sql);
    console.log('🎉 Migration executed successfully!');

    // Verify tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\nVerified Tables created in public schema:');
    console.log(res.rows.map(r => '  - ' + r.table_name).join('\n'));

    // Verify tenant
    const tenants = await client.query('SELECT id, slug, name FROM tenants;');
    console.log('\nSeeded Tenants:', tenants.rows);

    // Verify profile
    const profile = await client.query('SELECT id, display_name, tenant_id FROM profile;');
    console.log('\nSeeded Profiles:', profile.rows);

    // Verify services
    const services = await client.query('SELECT count(*) FROM services;');
    console.log('\nServices count:', services.rows[0].count);

    // Verify reviews
    const reviews = await client.query('SELECT count(*) FROM reviews;');
    console.log('Reviews count:', reviews.rows[0].count);

    // Verify project images
    const projImages = await client.query('SELECT count(*) FROM project_images;');
    console.log('Project Images count:', projImages.rows[0].count);

    // Verify books
    const books = await client.query('SELECT count(*) FROM books;');
    console.log('Books count:', books.rows[0].count);

  } catch (err) {
    console.error('Error executing SQL migration:', err);
  } finally {
    await client.end().catch(() => {});
  }
}

run();
