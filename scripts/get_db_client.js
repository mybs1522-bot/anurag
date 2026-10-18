const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function getDbClient() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length) process.env[k.trim()] = v.join('=').trim();
      }
    });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment or .env.local');
  }

  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
}

module.exports = { getDbClient };
