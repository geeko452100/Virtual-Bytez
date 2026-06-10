/**
 * Generate TypeScript types from a linked Supabase project.
 *
 * Usage:
 *   npm run gen:types
 *
 * Requires Supabase CLI (`npx supabase`) and either:
 *   - `supabase link` for remote project, or
 *   - `supabase start` for local stack
 */
import { execSync } from 'child_process'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outFile = join(root, 'src/types/database.ts')

mkdirSync(dirname(outFile), { recursive: true })

const projectId = process.env.SUPABASE_PROJECT_ID

try {
  const cmd = projectId
    ? `npx supabase gen types typescript --project-id ${projectId}`
    : 'npx supabase gen types typescript --linked'

  const output = execSync(cmd, { cwd: root, encoding: 'utf8' })
  Bun?.write?.(outFile, output)

  if (!Bun) {
    const { writeFileSync } = await import('fs')
    writeFileSync(outFile, output)
  }

  console.log(`Wrote ${outFile}`)
} catch (err) {
  console.error('Type generation failed.')
  console.error('Install Supabase CLI and run `supabase link`, or set SUPABASE_PROJECT_ID.')
  console.error(err.message)
  process.exit(1)
}
