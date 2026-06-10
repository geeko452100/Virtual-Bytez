/**
 * Upload the local seed catalog to Supabase.
 *
 * Usage: npm run seed
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

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

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const { seedProducts } = await import(join(root, 'src/data/products.js'))
const { mapProductToRow } = await import(join(root, 'src/lib/productMapper.js'))

const supabase = createClient(url, key)

console.log(`Seeding ${seedProducts.length} products…`)

for (const product of seedProducts) {
  const { error } = await supabase.from('products').upsert(mapProductToRow(product))
  if (error) {
    console.error(`Failed: ${product.id}`, error.message)
    process.exit(1)
  }
  console.log(`  ✓ ${product.id}`)
}

console.log('Done.')
