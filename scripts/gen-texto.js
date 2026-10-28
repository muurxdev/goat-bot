/**
 * Gerador da família TEXTO E ESCRITA (.txt1 … .txt160).
 *
 * POR QUE UM GERADOR
 * Os 160 comandos são a MESMA casca: pegar o texto, chamar uma operação do
 * textStudioService e devolver com F.tela. Escrever isso 160 vezes à mão dá
 * 160 oportunidades de errar o schema, o cooldown ou o require. Aqui a casca
 * existe uma vez só e a tabela declarativa é o catálogo de operações do próprio
 * serviço — fonte de verdade única, sem lista paralela para desincronizar.
 *
 * O QUE ELE GARANTE ANTES DE ESCREVER QUALQUER ARQUIVO
 *  1. O registro de comandos do projeto é carregado (NODE_ENV=test) e nenhum
 *     nome txtN pode existir — nem como nome, nem como apelido de outro comando.
 *  2. São exatamente 160 operações, sem id repetido.
 *  3. Toda descrição tem no máximo 55 caracteres e não começa com emoji.
 *  4. A subcategoria é uma das quatro combinadas.
 *  5. Nenhum caractere de moldura (proibidos pelo tests/formato-uso.test.js)
 *     entra em texto nenhum do comando.
 * Falhando qualquer uma, o gerador aborta sem escrever nada.
 *
 * Uso: node scripts/gen-texto.js
 * Saída: src/commands/texto/txt1.js … txt160.js + scripts/manifests/txt_arquivos.json
 */
process.env.NODE_ENV = 'test'

const fs = require('fs')
const path = require('path')

const RAIZ = path.resolve(__dirname, '..')
const PASTA = path.join(RAIZ, 'src', 'commands', 'texto')
const MANIFESTO = path.join(RAIZ, 'scripts', 'manifests', 'txt_arquivos.json')

const SUBCATEGORIAS = new Set(['Transformar', 'Analisar', 'Códigos', 'Criar'])
const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const QUANTIDADE = 160
const COOLDOWN = 3000

function abortar(motivo) {
    console.error('❌ ' + motivo)
    process.exit(1)
}

// ── 1. Limpa a pasta da família (só ela) para o registro nascer limpo ──────
if (!fs.existsSync(PASTA)) fs.mkdirSync(PASTA, { recursive: true })
const antigos = fs.readdirSync(PASTA).filter(f => f.endsWith('.js'))
for (const f of antigos) fs.unlinkSync(path.join(PASTA, f))
if (antigos.length) console.log(`🧹 Removi ${antigos.length} arquivo(s) da geração anterior.`)

// ── 2. Carrega o registro e confere que os nomes estão livres ──────────────
const dispatcher = require(path.join(RAIZ, 'src', 'handlers', 'commandDispatcher'))
dispatcher.loadCommands()
const ocupados = new Set()
for (const cmd of dispatcher.getCommands().values()) {
    ocupados.add(String(cmd.name).toLowerCase())
    for (const a of (cmd.aliases || [])) ocupados.add(String(a).toLowerCase())
}
console.log(`📚 Registro carregado: ${dispatcher.getCommands().size} comandos, ${ocupados.size} nomes e apelidos ocupados.`)

const colisoes = []
for (let i = 1; i <= QUANTIDADE; i++) if (ocupados.has('txt' + i)) colisoes.push('txt' + i)
if (colisoes.length) abortar(`Nome já usado no projeto: ${colisoes.join(', ')}.`)

// ── 3. Tabela declarativa: a ordem do catálogo vira a numeração ────────────
const estudio = require(path.join(RAIZ, 'src', 'services', 'textStudioService'))
const TABELA = estudio.OPS.map((op, i) => ({
    nome: 'txt' + (i + 1),
    arquivo: 'txt' + (i + 1) + '.js',
    operacao: op.id,
    subcategoria: op.sub,
    titulo: op.titulo,
    descricao: op.descricao,
    usage: op.usage,
    examples: op.examples
}))

// ── 4. Conferências antes de escrever ─────────────────────────────────────
if (TABELA.length !== QUANTIDADE) abortar(`O catálogo tem ${TABELA.length} operações, e o combinado são ${QUANTIDADE}.`)

const vistos = new Set()
for (const item of TABELA) {
    if (vistos.has(item.operacao)) abortar(`Operação repetida no catálogo: ${item.operacao}.`)
    vistos.add(item.operacao)
    if (!SUBCATEGORIAS.has(item.subcategoria)) abortar(`${item.nome}: subcategoria "${item.subcategoria}" não é uma das quatro combinadas.`)
    if (!item.descricao || item.descricao.length > 55) abortar(`${item.nome}: descrição com ${item.descricao.length} caracteres (o teto é 55).`)
    if (/^\p{Extended_Pictographic}/u.test(item.descricao.trim())) abortar(`${item.nome}: descrição não pode começar com emoji.`)
    if (!item.usage || !Array.isArray(item.examples) || !item.examples.length) abortar(`${item.nome}: falta usage ou examples.`)
    for (const campo of [item.descricao, item.usage, item.titulo, ...item.examples]) {
        if (CAIXA.test(campo)) abortar(`${item.nome}: caractere de moldura proibido em "${campo}".`)
    }
}

// ── 5. A casca do comando ─────────────────────────────────────────────────
function montarArquivo(item) {
    const j = JSON.stringify
    return `/**
 * Comando .${item.nome} — ${item.titulo}.
 *
 * Arquivo GERADO por scripts/gen-texto.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/textStudioService.js, na operação
 * ${j(item.operacao)}. Aqui só acontece a apresentação. As operações de criar texto passam pelo
 * Claude em src/services/textStudioIA.js (as demais voltam direto para o serviço local).
 */
const F = require('../../utils/formato')
const estudio = require('../../services/textStudioService')
const estudioIA = require('../../services/textStudioIA')
const logger = require('../../core/logger')

const OPERACAO = ${j(item.operacao)}
const NOME = ${j(item.nome)}

module.exports = {
    name: NOME,
    aliases: [],
    category: 'texto',
    subcategory: ${j(item.subcategoria)},
    description: ${j(item.descricao)},
    usage: ${j(item.usage)},
    examples: ${j(item.examples)},
    cooldownMs: ${COOLDOWN},
    execute: async ({ reply, args = [], prefix = '.', info }) => {
        const entrada = estudio.entradaDe(args, info)
        if (!entrada) {
            return reply(F.tela(estudio.telaDeAjuda(OPERACAO, { prefix, nome: NOME })))
        }
        try {
            return reply(F.tela(await estudioIA.telaDeResultado(OPERACAO, entrada, { prefix, nome: NOME })))
        } catch (erro) {
            logger.error('[TEXTO] .' + NOME + ' (' + OPERACAO + ') falhou: ' + erro.message, erro)
            return reply('❌ Não consegui trabalhar esse texto agora. Tente de novo com um trecho menor.')
        }
    }
}
`
}

// ── 6. Escreve ────────────────────────────────────────────────────────────
let criados = 0
for (const item of TABELA) {
    fs.writeFileSync(path.join(PASTA, item.arquivo), montarArquivo(item))
    criados++
}

if (!fs.existsSync(path.dirname(MANIFESTO))) fs.mkdirSync(path.dirname(MANIFESTO), { recursive: true })
fs.writeFileSync(MANIFESTO, JSON.stringify({
    familia: 'texto',
    servico: 'src/services/textStudioService.js',
    gerador: 'scripts/gen-texto.js',
    geradoEm: new Date().toISOString(),
    total: TABELA.length,
    porSubcategoria: TABELA.reduce((acc, i) => { acc[i.subcategoria] = (acc[i.subcategoria] || 0) + 1; return acc }, {}),
    arquivos: TABELA.map(i => ({
        arquivo: 'src/commands/texto/' + i.arquivo,
        nome: i.nome,
        operacao: i.operacao,
        subcategoria: i.subcategoria,
        descricao: i.descricao
    }))
}, null, 2) + '\n')

console.log(`✅ ${criados} comandos escritos em src/commands/texto/`)
console.log(`📄 Manifesto: ${path.relative(RAIZ, MANIFESTO)}`)
const porSub = TABELA.reduce((a, i) => { a[i.subcategoria] = (a[i.subcategoria] || 0) + 1; return a }, {})
for (const [sub, n] of Object.entries(porSub)) console.log(`   • ${sub}: ${n}`)
