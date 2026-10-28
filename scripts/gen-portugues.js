/**
 * Gerador da família PORTUGUÊS, REDAÇÃO E LITERATURA (.port1 … .port150).
 *
 * POR QUE UM GERADOR
 * Os 150 comandos são a MESMA casca: pegar o que a pessoa escreveu, chamar uma
 * operação do portugueseService e devolver com F.tela. Escrever isso 150 vezes
 * à mão dá 150 chances de errar o schema, o cooldown ou o require. Aqui a casca
 * existe uma vez só e a tabela declarativa é o catálogo do próprio serviço —
 * fonte de verdade única, sem lista paralela para desincronizar.
 *
 * A PASTA É COMPARTILHADA
 * src/commands/escola/ também guarda a família mat* (Matemática). Este gerador
 * apaga e escreve SÓ os arquivos que casam com /^port\d+\.js$/. Qualquer outro
 * arquivo da pasta é intocável — inclusive os da outra frente.
 *
 * O QUE ELE GARANTE ANTES DE ESCREVER QUALQUER ARQUIVO
 *  1. O registro de comandos do projeto é carregado (NODE_ENV=test) e nenhum
 *     nome portN pode existir — nem como nome, nem como apelido de outro comando.
 *  2. São exatamente 150 operações, sem id repetido.
 *  3. Toda descrição tem no máximo 55 caracteres, não se repete dentro da
 *     família e não começa com emoji.
 *  4. A subcategoria é uma das três combinadas.
 *  5. Nenhum caractere de moldura (proibidos por tests/formato-uso.test.js)
 *     entra em texto nenhum do comando.
 * Falhando qualquer uma, o gerador aborta sem escrever nada.
 *
 * Uso: node scripts/gen-portugues.js
 * Saída: src/commands/escola/port1.js … port150.js
 *        + scripts/manifests/port_arquivos.json
 */
process.env.NODE_ENV = 'test'

const fs = require('fs')
const path = require('path')

const RAIZ = path.resolve(__dirname, '..')
const PASTA = path.join(RAIZ, 'src', 'commands', 'escola')
const MANIFESTO = path.join(RAIZ, 'scripts', 'manifests', 'port_arquivos.json')

const PREFIXO = 'port'
const DA_FAMILIA = /^port\d+\.js$/
const SUBCATEGORIAS = new Set(['Português', 'Redação', 'Literatura'])
const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const QUANTIDADE = 150
const COOLDOWN = 3000

function abortar(motivo) {
    console.error('❌ ' + motivo)
    process.exit(1)
}

// ── 1. Limpa SÓ os arquivos desta família ─────────────────────────────────
if (!fs.existsSync(PASTA)) fs.mkdirSync(PASTA, { recursive: true })
const naPasta = fs.readdirSync(PASTA).filter(f => f.endsWith('.js'))
const meus = naPasta.filter(f => DA_FAMILIA.test(f))
const dosOutros = naPasta.filter(f => !DA_FAMILIA.test(f))
for (const f of meus) fs.unlinkSync(path.join(PASTA, f))
if (meus.length) console.log(`🧹 Removi ${meus.length} arquivo(s) port da geração anterior.`)
if (dosOutros.length) console.log(`🤝 Deixei intactos ${dosOutros.length} arquivo(s) de outras famílias na mesma pasta.`)

// ── 2. Carrega o registro e confere que os nomes estão livres ─────────────
const dispatcher = require(path.join(RAIZ, 'src', 'handlers', 'commandDispatcher'))
dispatcher.loadCommands()
const ocupados = new Set()
for (const cmd of dispatcher.getCommands().values()) {
    ocupados.add(String(cmd.name).toLowerCase())
    for (const a of (cmd.aliases || [])) ocupados.add(String(a).toLowerCase())
}
console.log(`📚 Registro carregado: ${dispatcher.getCommands().size} comandos, ${ocupados.size} nomes e apelidos ocupados.`)

const colisoes = []
for (let i = 1; i <= QUANTIDADE; i++) if (ocupados.has(PREFIXO + i)) colisoes.push(PREFIXO + i)
if (colisoes.length) abortar(`Nome já usado no projeto: ${colisoes.join(', ')}.`)

// ── 3. Tabela declarativa: a ordem do catálogo vira a numeração ───────────
const aula = require(path.join(RAIZ, 'src', 'services', 'portugueseService'))
const TABELA = aula.OPS.map((op, i) => ({
    nome: PREFIXO + (i + 1),
    arquivo: PREFIXO + (i + 1) + '.js',
    operacao: op.id,
    subcategoria: op.sub,
    titulo: op.titulo,
    descricao: op.descricao,
    usage: op.usage,
    examples: op.examples
}))

// ── 4. Conferências antes de escrever ────────────────────────────────────
if (TABELA.length !== QUANTIDADE) abortar(`O catálogo tem ${TABELA.length} operações, e o combinado são ${QUANTIDADE}.`)

const vistos = new Set()
const descricoes = new Map()
for (const item of TABELA) {
    if (vistos.has(item.operacao)) abortar(`Operação repetida no catálogo: ${item.operacao}.`)
    vistos.add(item.operacao)
    if (!SUBCATEGORIAS.has(item.subcategoria)) abortar(`${item.nome}: subcategoria "${item.subcategoria}" não é uma das três combinadas.`)
    if (!item.descricao) abortar(`${item.nome}: sem descrição.`)
    if (item.descricao.length > 55) abortar(`${item.nome}: descrição com ${item.descricao.length} caracteres (o teto é 55) — "${item.descricao}".`)
    if (descricoes.has(item.descricao)) abortar(`${item.nome} e ${descricoes.get(item.descricao)} têm a mesma descrição: "${item.descricao}".`)
    descricoes.set(item.descricao, item.nome)
    if (/^\p{Extended_Pictographic}/u.test(item.descricao.trim())) abortar(`${item.nome}: descrição não pode começar com emoji.`)
    if (!item.usage || !Array.isArray(item.examples) || !item.examples.length) abortar(`${item.nome}: falta usage ou examples.`)
    for (const campo of [item.descricao, item.usage, item.titulo, ...item.examples]) {
        if (CAIXA.test(campo)) abortar(`${item.nome}: caractere de moldura proibido em "${campo}".`)
    }
}

// ── 5. A casca do comando ────────────────────────────────────────────────
function montarArquivo(item) {
    const j = JSON.stringify
    return `/**
 * Comando .${item.nome} — ${item.titulo}.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * ${j(item.operacao)}. Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = ${j(item.operacao)}
const NOME = ${j(item.nome)}

module.exports = {
    name: NOME,
    aliases: [],
    category: 'escola',
    subcategory: ${j(item.subcategoria)},
    description: ${j(item.descricao)},
    usage: ${j(item.usage)},
    examples: ${j(item.examples)},
    cooldownMs: ${COOLDOWN},
    execute: async ({ reply, args = [], prefix = '.', info }) => {
        const entrada = aula.entradaDe(args, info)
        if (!entrada) {
            return reply(F.tela(aula.telaDeAjuda(OPERACAO, { prefix, nome: NOME })))
        }
        try {
            return reply(F.tela(aula.telaDeResultado(OPERACAO, entrada, { prefix, nome: NOME })))
        } catch (erro) {
            logger.error('[ESCOLA] .' + NOME + ' (' + OPERACAO + ') falhou: ' + erro.message, erro)
            return reply('❌ Não consegui analisar isso agora. Tente de novo com um trecho menor.')
        }
    }
}
`
}

// ── 6. Escreve ───────────────────────────────────────────────────────────
let criados = 0
for (const item of TABELA) {
    fs.writeFileSync(path.join(PASTA, item.arquivo), montarArquivo(item))
    criados++
}

if (!fs.existsSync(path.dirname(MANIFESTO))) fs.mkdirSync(path.dirname(MANIFESTO), { recursive: true })
fs.writeFileSync(MANIFESTO, JSON.stringify({
    familia: 'português, redação e literatura',
    servico: 'src/services/portugueseService.js',
    gerador: 'scripts/gen-portugues.js',
    geradoEm: new Date().toISOString(),
    total: TABELA.length,
    porSubcategoria: TABELA.reduce((acc, i) => { acc[i.subcategoria] = (acc[i.subcategoria] || 0) + 1; return acc }, {}),
    arquivos: TABELA.map(i => ({
        arquivo: 'src/commands/escola/' + i.arquivo,
        nome: i.nome,
        operacao: i.operacao,
        subcategoria: i.subcategoria,
        descricao: i.descricao
    }))
}, null, 2) + '\n')

console.log(`✅ ${criados} comandos escritos em src/commands/escola/`)
console.log(`📄 Manifesto: ${path.relative(RAIZ, MANIFESTO)}`)
const porSub = TABELA.reduce((a, i) => { a[i.subcategoria] = (a[i.subcategoria] || 0) + 1; return a }, {})
for (const [sub, n] of Object.entries(porSub)) console.log(`   • ${sub}: ${n}`)
