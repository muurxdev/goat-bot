/**
 * Lista os comandos que respondem "seco": só uma frase ou um dado solto, sem a ficha informativa
 * que o resto do bot entrega (título, dados, contexto, próximos passos).
 *
 * Lê o JSON que o `scripts/testar-comandos.js` grava e separa, entre os que responderam `ok`:
 *   - guarda de entrada ("Como usar", "Quem?", "Faltou…"): não conta — é o aviso de uso;
 *   - seco: resposta de conteúdo com menos de LIMITE caracteres (padrão 220);
 *   - sem moldura: resposta de conteúdo fora do layout padrão (╔═ / ╭━〔 / ┃) — só informativo.
 *
 * Uso:
 *   node scripts/testar-comandos.js --passe=dispatch --papel=comum --args=exemplos --cat=economy
 *   node scripts/achar-respostas-secas.js relatorio-comandos-dispatch-comum-grupo-exemplos.json [--limite=220] [--sem-moldura] [--cat=economy] [--json]
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const arquivo = args.find(a => !a.startsWith('--'))
const opt = (nome, padrao) => {
    const a = args.find(x => x.startsWith('--' + nome + '='))
    return a ? a.slice(nome.length + 3) : padrao
}
if (!arquivo) {
    console.error('Uso: node scripts/achar-respostas-secas.js <relatorio-comandos-*.json> [--limite=220] [--cat=x] [--sem-moldura] [--json]')
    process.exit(2)
}

const LIMITE = parseInt(opt('limite', '220'), 10)
const CATEGORIA = opt('cat', null)
const MOSTRAR_SEM_MOLDURA = args.includes('--sem-moldura')
const SAIDA_JSON = args.includes('--json')

const GUARDA = /Como usar|Preciso de um texto|\*Quem\?\*|Faltou|Informe|Use:|Uso:|Uso correto|Digite assim|Marque|Responda|Diga (de )?quem|Só (a )?administra|Só administradores|Só o dono|Só donos/i
const MOLDURA = /╔═|╭━〔|┃/

const relatorio = JSON.parse(fs.readFileSync(path.resolve(arquivo), 'utf8'))
const secos = []
const semMoldura = []
const porCategoria = {}

for (const r of relatorio.registros) {
    if (r.classe !== 'ok') continue
    if (CATEGORIA && r.categoria !== CATEGORIA) continue
    const texto = r.amostra || ''
    const n = Number((/(\d+) chars/.exec(r.motivo || '') || [])[1] || 0)
    const cat = (porCategoria[r.categoria] = porCategoria[r.categoria] || { total: 0, secos: 0, semMoldura: 0 })
    cat.total++
    if (GUARDA.test(texto)) continue
    if (n < LIMITE) { secos.push({ nome: r.nome, categoria: r.categoria, chars: n, amostra: texto }); cat.secos++ }
    if (!MOLDURA.test(texto)) { semMoldura.push({ nome: r.nome, categoria: r.categoria, chars: n, amostra: texto }); cat.semMoldura++ }
}

if (SAIDA_JSON) {
    console.log(JSON.stringify({ secos, semMoldura, porCategoria }, null, 2))
    process.exit(0)
}

console.log(`Comandos secos (resposta de conteúdo < ${LIMITE} chars): ${secos.length}`)
for (const s of secos.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome))) {
    console.log(`- .${s.nome} [${s.categoria}] (${s.chars}) ${s.amostra.replace(/\s+/g, ' ').slice(0, 140)}`)
}
if (MOSTRAR_SEM_MOLDURA) {
    console.log(`\nResposta de conteúdo fora do layout padrão: ${semMoldura.length}`)
    for (const s of semMoldura.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome))) {
        console.log(`- .${s.nome} [${s.categoria}] (${s.chars}) ${s.amostra.replace(/\s+/g, ' ').slice(0, 140)}`)
    }
}
console.log('\nPor categoria:')
console.table(porCategoria)
