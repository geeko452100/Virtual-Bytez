/**
 * Apply supabase/migrations/*.sql to the linked Supabase database.
 *
 * Set DATABASE_URL in .env, e.g. from Supabase Dashboard:
 * Project Settings → Database → Connection string → URI
 */
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const { Client } = pg

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const migrationsDir = join(root, 'supabase', 'migrations')

function loadEnv() {
  try {
    const envFile = readFileSync(join(root, '.env'), 'utf8')
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (!process.env[key]) process.env[key] = rest.join('=').trim()
    }
  } catch {
    // .env optional when vars are already exported
  }
}

loadEnv()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error(
    'Missing DATABASE_URL in .env.\n' +
      'Supabase Dashboard → Project Settings → Database → Connection string → URI\n' +
      'Add: DATABASE_URL=postgresql://postgres.[ref]:[password]@...'
  )
  process.exit(1)
}

const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()

if (files.length === 0) {
  console.error('No migration files found in supabase/migrations/')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()

  await client.query(`
    create table if not exists public.schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `)

  const { rows: applied } = await client.query(
    'select filename from public.schema_migrations'
  )
  const appliedSet = new Set(applied.map((row) => row.filename))

  const pending = files.filter((file) => !appliedSet.has(file))
  if (pending.length === 0) {
    console.log('No pending migrations.')
  } else {
  console.log(`Connected. Running ${pending.length} pending migration(s)...`)

  for (const file of pending) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    console.log(`→ ${file}`)
    await client.query(sql)
    await client.query(
      'insert into public.schema_migrations (filename) values ($1)',
      [file]
    )
    console.log(`  ✓ done`)
  }

  await client.query("NOTIFY pgrst, 'reload schema'")
  console.log('Schema cache reloaded. Migration complete.')
  }
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
