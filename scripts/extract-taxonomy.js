/**
 * Script one-off: extrai a curadoria de subcategorias já existente dentro do
 * menu.js hardcoded e emite src/config/commandTaxonomy.js.
 *
 * Preserva o trabalho manual de classificação (títulos de seção + comandos sob
 * cada uma) sem editar 400+ arquivos à mão. Rode uma vez:
 *   node scripts/extract-taxonomy.js
 */

const fs = require('fs')
const path = require('path')

const menuPath = path.join(__dirname, '..', 'src', 'commands', 'general', 'menu.js')
const outPath = path.join(__dirname, '..', 'src', 'config', 'commandTaxonomy.js')

const lines = fs.readFileSync(menuPath, 'utf8').split('\n')

const headerRe = /╭━〔\s*(.+?)\s*〕━⬣/          // captura "EMOJI TÍTULO"
const tokenRe = /\bp\s*\+\s*"([a-z0-9_\-]+)`/gi   // cada `p + "token"` na linha

const taxonomy = {}   // token -> título da subcategoria
let currentTitle = null

for (const line of lines) {
    const h = line.match(headerRe)
    if (h) {
        currentTitle = h[1].trim()
        continue
    }
    if (!currentTitle) continue
    // linha de comando: mapeia todos os tokens (nome + aliases citados) à seção atual
    let m
    while ((m = tokenRe.exec(line)) !== null) {
        const token = m[1].toLowerCase()
        if (!(token in taxonomy)) taxonomy[token] = currentTitle
    }
}

const entries = Object.entries(taxonomy).sort((a, b) => a[0].localeCompare(b[0]))

let out = `/**\n`
out += ` * Mapa de subcategorias por comando — gerado por scripts/extract-taxonomy.js\n`
out += ` * a partir da curadoria manual que existia no menu.js hardcoded.\n`
out += ` *\n`
out += ` * Fonte transitória para o LEGADO. Comandos novos devem declarar\n`
out += ` * \`subcategory\` no próprio arquivo em vez de adicionar aqui.\n`
out += ` *\n`
out += ` *   token (nome ou alias, lowercase) -> título da subcategoria\n`
out += ` */\n`
out += `module.exports = {\n`
for (const [token, title] of entries) {
    out += `    ${JSON.stringify(token)}: ${JSON.stringify(title)},\n`
}
out += `}\n`

fs.writeFileSync(outPath, out)
console.log(`✅ ${entries.length} tokens mapeados -> ${path.relative(path.join(__dirname, '..'), outPath)}`)

// Resumo por título
const byTitle = {}
for (const [, title] of entries) byTitle[title] = (byTitle[title] || 0) + 1
console.log(`\nSubcategorias encontradas (${Object.keys(byTitle).length}):`)
for (const [title, n] of Object.entries(byTitle).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(3)}  ${title}`)
}
