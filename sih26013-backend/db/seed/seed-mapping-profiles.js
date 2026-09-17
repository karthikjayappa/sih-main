/**
 * Loads db/seed/mapping-profiles.json into the mapping_profiles table.
 * Upserts by profile_id so it's safe to re-run.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const profiles = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'mapping-profiles.json'), 'utf8')
  );

  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'land_conflation',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  });

  await client.connect();

  for (const p of profiles) {
    await client.query(
      `INSERT INTO mapping_profiles (profile_id, source_system, file_type, description, field_mappings)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (profile_id) DO UPDATE
         SET source_system = EXCLUDED.source_system,
             file_type = EXCLUDED.file_type,
             description = EXCLUDED.description,
             field_mappings = EXCLUDED.field_mappings,
             updated_at = now()`,
      [p.profile_id, p.source_system, p.file_type, p.description, JSON.stringify(p.field_mappings)]
    );
    console.log(`Upserted mapping profile: ${p.profile_id}`);
  }

  await client.end();
  console.log('Mapping profiles seeded.');
}

run().catch((err) => {
  console.error('Failed to seed mapping profiles:', err.message);
  process.exit(1);
});
