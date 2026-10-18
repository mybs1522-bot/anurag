const { getDbClient } = require('./get_db_client');

async function run() {
  const client = getDbClient();

  await client.connect();

  const b1Previews = JSON.stringify([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop'
  ]);

  const b2Previews = JSON.stringify([
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop'
  ]);

  const b3Previews = JSON.stringify([
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop'
  ]);

  await client.query('UPDATE books SET preview_images = $1 WHERE id = $2', [b1Previews, 'book-1']);
  await client.query('UPDATE books SET preview_images = $1 WHERE id = $2', [b2Previews, 'book-2']);
  await client.query('UPDATE books SET preview_images = $1 WHERE id = $2', [b3Previews, 'book-3']);

  console.log('✅ Successfully updated books with demo preview pages in Supabase!');

  const check = await client.query('SELECT id, title, jsonb_array_length(preview_images) as pages_count FROM books');
  console.log('Verified books preview counts:', check.rows);

  await client.end();
}

run().catch(console.error);
