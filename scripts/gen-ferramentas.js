/**
 * Gerador da família FERRAMENTAS (.ferr1 … .ferr360).
 *
 * POR QUE UM GERADOR
 * Os 360 comandos são a MESMA casca: receber os argumentos, chamar responder()
 * de um dos dois serviços e devolver o resultado com F.tela. Escrever isso 360
 * vezes à mão dá 360 chances de errar o schema, o cooldown ou o require. Aqui a
 * casca existe uma vez só e o catálogo é o próprio registro dos serviços —
 * fonte de verdade única, sem lista paralela para desincronizar.
 *
 * DE ONDE VEM CADA COMANDO
 *  • ferr1 a ferr120   → src/services/converterService.js (Conversões)
 *  • ferr121 a ferr360 → src/services/toolboxService.js
 *      Calculadoras (120), Documentos (50), Geradores (40) e Data e Hora (30)
 *
 * O QUE ELE CONFERE ANTES DE ESCREVER QUALQUER ARQUIVO
 *  1. O registro de comandos do projeto é carregado (NODE_ENV=test) e nenhum
 *     nome ferrN pode existir — nem como nome, nem como apelido de outro comando.
 *  2. São exatamente 360 ferramentas, sem chave repetida.
 *  3. Toda descrição tem no máximo 55 caracteres, não começa com emoji e não se
 *     repete dentro da família (a peneira do projeto reprova as duas coisas).
 *  4. A subcategoria é uma das cinco combinadas.
 *  5. Nenhum caractere de moldura (barrado por tests/formato-uso.test.js) entra
 *     em texto nenhum do comando.
 * Falhando qualquer uma, o gerador aborta sem escrever nada.
 *
 * Uso: node scripts/gen-ferramentas.js
 * Saída: src/commands/ferramentas/ferr1.js … ferr360.js
 *        + scripts/manifests/ferr_arquivos.json
 */
process.env.NODE_ENV = 'test'

const fs = require('fs')
const path = require('path')

const RAIZ = path.resolve(__dirname, '..')
const PASTA = path.join(RAIZ, 'src', 'commands', 'ferramentas')
const MANIFESTO = path.join(RAIZ, 'scripts', 'manifests', 'ferr_arquivos.json')

const SUBCATEGORIAS = new Set(['Conversões', 'Calculadoras', 'Documentos', 'Geradores', 'Data e Hora'])
const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const QUANTIDADE = 360
const COOLDOWN = 3000
const TETO_DESCRICAO = 55

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
for (let i = 1; i <= QUANTIDADE; i++) if (ocupados.has('ferr' + i)) colisoes.push('ferr' + i)
if (colisoes.length) abortar(`Nome já usado no projeto: ${colisoes.slice(0, 10).join(', ')}.`)

// ── 3. Tabela declarativa: a ordem dos catálogos vira a numeração ──────────
const SERVICOS = [
    { modulo: 'converterService', servico: require(path.join(RAIZ, 'src', 'services', 'converterService')) },
    { modulo: 'toolboxService', servico: require(path.join(RAIZ, 'src', 'services', 'toolboxService')) }
]

const TABELA = []
for (const { modulo, servico } of SERVICOS) {
    for (const chave of servico.chaves()) {
        const m = servico.meta(chave)
        if (!m) abortar(`${modulo}: a chave ${chave} não devolveu metadados.`)
        const n = TABELA.length + 1
        TABELA.push({
            nome: 'ferr' + n,
            arquivo: 'ferr' + n + '.js',
            modulo,
            chave,
            subcategoria: m.sub,
            titulo: m.titulo,
            descricao: m.descricao,
            usage: m.uso,
            examples: m.exemplos
        })
    }
}

// ── 4. Conferências antes de escrever ─────────────────────────────────────
if (TABELA.length !== QUANTIDADE) abortar(`Os catálogos somam ${TABELA.length} ferramentas, e o combinado são ${QUANTIDADE}.`)

const chavesVistas = new Set()
const descricoesVistas = new Map()
for (const item of TABELA) {
    const id = item.modulo + ':' + item.chave
    if (chavesVistas.has(id)) abortar(`Ferramenta repetida no catálogo: ${id}.`)
    chavesVistas.add(id)

    if (!SUBCATEGORIAS.has(item.subcategoria)) abortar(`${item.nome} (${item.chave}): subcategoria "${item.subcategoria}" não é uma das cinco combinadas.`)
    if (!item.descricao) abortar(`${item.nome} (${item.chave}): sem descrição.`)
    if (item.descricao.length > TETO_DESCRICAO) abortar(`${item.nome} (${item.chave}): descrição com ${item.descricao.length} caracteres (o teto é ${TETO_DESCRICAO}) — "${item.descricao}".`)
    if (/^\p{Extended_Pictographic}/u.test(item.descricao.trim())) abortar(`${item.nome} (${item.chave}): descrição não pode começar com emoji.`)
    const repetida = descricoesVistas.get(item.descricao)
    if (repetida) abortar(`${item.nome} (${item.chave}) repete a descrição de ${repetida}: "${item.descricao}".`)
    descricoesVistas.set(item.descricao, `${item.nome} (${item.chave})`)

    if (!item.usage) abortar(`${item.nome} (${item.chave}): falta o texto de uso.`)
    if (!Array.isArray(item.examples) || !item.examples.length) abortar(`${item.nome} (${item.chave}): falta exemplo.`)
    if (!item.titulo) abortar(`${item.nome} (${item.chave}): falta título.`)

    for (const campo of [item.descricao, item.usage, item.titulo, ...item.examples]) {
        if (CAIXA.test(campo)) abortar(`${item.nome} (${item.chave}): caractere de moldura proibido em "${campo}".`)
    }
}

// ── 5. A casca do comando ─────────────────────────────────────────────────
function montarArquivo(item) {
    const j = JSON.stringify
    return `/**
 * Comando .${item.nome} — ${item.titulo}.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/${item.modulo}.js, na ferramenta
 * ${j(item.chave)}. Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/${item.modulo}')
const logger = require('../../core/logger')

const FERRAMENTA = ${j(item.chave)}
const NOME = ${j(item.nome)}

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: ${j(item.subcategoria)},
    description: ${j(item.descricao)},
    usage: ${j(item.usage)},
    examples: ${j(item.examples)},
    cooldownMs: ${COOLDOWN},
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
            const tela = servico.responder(FERRAMENTA, args, { nome: NOME, prefix })
            return reply(F.tela(tela))
        } catch (erro) {
            logger.error('[FERRAMENTAS] .' + NOME + ' (' + FERRAMENTA + ') falhou: ' + erro.message, erro)
            return reply('❌ Não consegui fazer essa conta agora. Confira os valores e tente de novo em instantes.')
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
const porSub = TABELA.reduce((acc, i) => { acc[i.subcategoria] = (acc[i.subcategoria] || 0) + 1; return acc }, {})
fs.writeFileSync(MANIFESTO, JSON.stringify({
    familia: 'ferramentas',
    servicos: ['src/services/converterService.js', 'src/services/toolboxService.js'],
    gerador: 'scripts/gen-ferramentas.js',
    geradoEm: new Date().toISOString(),
    total: TABELA.length,
    porSubcategoria: porSub,
    arquivos: TABELA.map(i => ({
        arquivo: 'src/commands/ferramentas/' + i.arquivo,
        nome: i.nome,
        servico: 'src/services/' + i.modulo + '.js',
        ferramenta: i.chave,
        subcategoria: i.subcategoria,
        descricao: i.descricao
    }))
}, null, 2) + '\n')

console.log(`✅ ${criados} comandos escritos em src/commands/ferramentas/`)
console.log(`📄 Manifesto: ${path.relative(RAIZ, MANIFESTO)}`)
for (const [sub, n] of Object.entries(porSub)) console.log(`   • ${sub}: ${n}`)
