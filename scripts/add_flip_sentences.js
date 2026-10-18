const { getDbClient } = require('./get_db_client');

async function run() {
  const client = getDbClient();

  await client.connect();

  await client.query('ALTER TABLE profile ADD COLUMN IF NOT EXISTS flip_sentences text[];');
  console.log('✅ Added flip_sentences to profile table');

  const defaults = [
    'Luxury Residential Architect',
    'Turnkey Interior Designer',
    'Sustainable Space Planner',
    'ArchBIZ & BOQ Consultant'
  ];

  await client.query('UPDATE profile SET flip_sentences = $1 WHERE flip_sentences IS NULL', [defaults]);
  console.log('✅ Updated default flip_sentences');

  const res = await client.query('SELECT id, display_name, flip_sentences FROM profile');
  console.log('Profile rows:', res.rows);

  await client.end();
}

run().catch(console.error);
