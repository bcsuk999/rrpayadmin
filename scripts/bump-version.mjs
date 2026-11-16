import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const outPath = resolve(process.cwd(), 'dist', 'version.json')
const version = String(Date.now())

mkdirSync(resolve(process.cwd(), 'dist'), { recursive: true })
writeFileSync(outPath, JSON.stringify({ version }, null, 2) + '\n', 'utf8')

console.log(`[bump-version] dist/version.json -> ${version}`)
