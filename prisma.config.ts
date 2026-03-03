import { defineConfig } from 'prisma/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnvFile(file: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx < 0) continue
      const key = trimmed.slice(0, idx).trim()
      let val = trimmed.slice(idx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // file doesn't exist, skip
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
