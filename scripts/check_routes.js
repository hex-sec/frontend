/* eslint-env node */
/* global console, process */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(currentDir, '..')
const ignoreDirs = ['node_modules', 'dist', '.git', 'coverage']
const pattern = /(["'`])\/(admin|site)\//g

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (ignoreDirs.includes(e.name)) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      walk(full)
    } else if (
      e.isFile() &&
      (full.endsWith('.tsx') || full.endsWith('.ts') || full.endsWith('.js'))
    ) {
      const content = fs.readFileSync(full, 'utf8')
      let match
      while ((match = pattern.exec(content)) !== null) {
        console.error(
          `Found hard-coded route in ${full}:${content.substring(0, match.index).split('\n').length}`,
        )
        // print a little context
        const start = Math.max(0, match.index - 40)
        console.error(content.substring(start, match.index + 80).replace(/\n/g, ' '))
        process.exitCode = 2
      }
    }
  }
}

walk(root)
if (process.exitCode) {
  console.error(
    'Hard-coded admin/site route literals detected. Use buildEntityUrl or a helper instead.',
  )
  process.exit(process.exitCode)
} else {
  console.log('No hard-coded admin/site route literals found.')
}
