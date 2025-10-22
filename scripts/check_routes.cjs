/* eslint-env node */
/* global require, __dirname, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

// Directories to skip during the scan (tooling, build artifacts, docs)
const ignoreDirs = ['node_modules', 'dist', '.git', 'coverage', 'transforms', 'scripts', 'docs']

// Files (relative to repo root) to skip explicitly
const ignoreFiles = [path.normalize('src/app/utils/contextPaths.ts')]

// Do not match route definitions that immediately follow with a parameter (e.g. '/site/:slug')
const pattern = /(["'`])\/(admin|site)\/(?!:)/g

function isIgnored(fullPath) {
  const rel = path.relative(root, fullPath)
  // skip tooling directories
  for (const d of ignoreDirs) {
    if (rel.split(path.sep)[0] === d) return true
  }
  // skip explicit files
  if (ignoreFiles.includes(path.normalize(rel))) return true
  return false
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (isIgnored(full)) continue
    if (e.isDirectory()) {
      walk(full)
    } else if (
      e.isFile() &&
      (full.endsWith('.tsx') ||
        full.endsWith('.ts') ||
        full.endsWith('.js') ||
        full.endsWith('.jsx'))
    ) {
      const content = fs.readFileSync(full, 'utf8')
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length
        console.error(`Found hard-coded route in ${full}:${lineNum}`)
        // print a little context (one line)
        const lines = content.split('\n')
        const context = lines[Math.max(0, lineNum - 1)].trim()
        console.error(`  ${context}`)
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
