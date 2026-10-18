const { getDbClient } = require('./get_db_client');

async function run() {
  const client = getDbClient();

  await client.connect();
  console.log('Connected to Supabase Postgres!');

  // 1. Enable RLS policy on storage.objects for public upload to project-images and book-covers
  try {
    await client.query(`
      DROP POLICY IF EXISTS "Public Select" ON storage.objects;
      CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING (bucket_id IN ('project-images', 'book-covers'));

      DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
      CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('project-images', 'book-covers'));

      DROP POLICY IF EXISTS "Public Update" ON storage.objects;
      CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id IN ('project-images', 'book-covers'));

      DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
      CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id IN ('project-images', 'book-covers'));
    `);
    console.log('✅ Storage policies for project-images & book-covers created!');
  } catch (err) {
    console.warn('Storage policies note:', err.message);
  }

  // 2. Ensure profile table has all needed columns and indexes
  await client.query(`
    ALTER TABLE profile ADD COLUMN IF NOT EXISTS avatar TEXT;
    ALTER TABLE profile ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop';
    ALTER TABLE profile ADD COLUMN IF NOT EXISTS cover_position TEXT DEFAULT 'center';
    ALTER TABLE profile ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;
  `);

  console.log('✅ Profile table columns verified with cover_image and cover_position!');
  await client.end();
}

run().catch(console.error);
