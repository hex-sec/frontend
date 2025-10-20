import fs from 'fs'
import path from 'path'

const base = path.resolve(__dirname, '..', 'src', 'i18n', 'locales')
const template = JSON.parse(fs.readFileSync(path.join(base, 'en.json'), 'utf8'))

function generate(lang: string) {
  const out = JSON.stringify(template, null, 2)
  fs.writeFileSync(path.join(base, `${lang}.json`), out)
  console.log('Generated', lang)
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: generate-locale <lang>')
  process.exit(1)
}
generate(args[0])
