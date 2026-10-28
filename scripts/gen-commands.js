/**
 * Gerador de comandos sob demanda.
 *
 * Lê um "batch" (array de definições de comando) e cria os arquivos em
 * src/commands/<category>/<name>.js, PULANDO qualquer nome/alias que já exista
 * (evita duplicatas e colisões). Cada `execute` é uma função REAL (serializada),
 * então os comandos nascem funcionais — nada de stub.
 *
 * Uso:
 *   node scripts/gen-commands.js <arquivo-do-batch.js>
 *   node scripts/gen-commands.js scripts/command-batch.example.js
 *
 * Formato do batch: module.exports = [ { name, aliases, category, subcategory,
 *   description, cooldownMs, execute: async (ctx) => { ... } }, ... ]
 *
 * IMPORTANTE: `execute` é serializada via toString() — NÃO use variáveis de fora
 * da função (closures não são serializadas). Coloque tabelas/dados INLINE no corpo.
 *
 * Todos os comandos novos nascem OFF (camada opt-in). Libere com `.modulo on <mod>`.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test'
const fs = require('fs')
const path = require('path')
const ROOT = path.resolve(__dirname, '..')

const batchPath = process.argv[2]
if (!batchPath) {
    console.error('Uso: node scripts/gen-commands.js <arquivo-do-batch.js>')
    process.exit(1)
}

const d = require(path.join(ROOT, 'src/handlers/commandDispatcher'))
d.loadCommands()
const taken = new Set()
for (const c of d.getCommands().values()) { taken.add(c.name); (c.aliases || []).forEach(a => taken.add(a)) }

const BATCH = require(path.resolve(batchPath))
let created = 0
const skipped = []

for (const cmd of BATCH) {
    if (!cmd || !cmd.name || typeof cmd.execute !== 'function' || !cmd.category) { skipped.push((cmd && cmd.name) || '?(inválido)'); continue }
    const dir = path.join(ROOT, 'src/commands', cmd.category)
    const file = path.join(dir, cmd.name + '.js')
    if (taken.has(cmd.name) || fs.existsSync(file)) { skipped.push(cmd.name + '(nome)'); continue }
    const aliases = (cmd.aliases || []).filter(a => !taken.has(a))
    taken.add(cmd.name); aliases.forEach(a => taken.add(a))

    const out = `/**\n * Comando .${cmd.name} — ${cmd.description || ''}\n */\n` +
        `module.exports = {\n` +
        `    name: ${JSON.stringify(cmd.name)},\n` +
        `    aliases: ${JSON.stringify(aliases)},\n` +
        `    category: ${JSON.stringify(cmd.category)},\n` +
        `    subcategory: ${JSON.stringify(cmd.subcategory || 'Utilidades')},\n` +
        `    description: ${JSON.stringify(cmd.description || '')},\n` +
        `    cooldownMs: ${cmd.cooldownMs || 1500},\n` +
        `    execute: ${cmd.execute.toString()}\n};\n`
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(file, out)
    created++
    console.log('  + ' + cmd.category + '/' + cmd.name + '.js')
}

console.log(`\nCriados: ${created} | Pulados: ${skipped.length}${skipped.length ? ' (' + skipped.join(', ') + ')' : ''}`)
console.log('Valide com: node tests/dispatcher-integrity.test.js')
