/**
 * Gerador da família ESCOLA — EXATAS: `.mat1` … `.mat180`.
 *
 * Os 180 arquivos de src/commands/escola/matN.js são derivados da tabela
 * declarativa que mora em src/services/exactSciencesService.js: cada tópico
 * registrado lá com `T({...})` vira, na ordem de declaração, um comando.
 * O arquivo gerado não sabe fazer conta nenhuma — ele só chama `responder()`
 * e imprime. Assim a conta tem um lugar só para estar certa (ou errada).
 *
 * A pasta src/commands/escola/ é dividida com a família `port*` (Português).
 * Este gerador só escreve e só apaga arquivos `matN.js`; nada de `port*` é
 * tocado, nem na hora de limpar sobras.
 *
 * Uso:
 *   node scripts/gen-matematica.js          grava os arquivos e o manifesto
 *   node scripts/gen-matematica.js --dry    só confere a tabela e conta
 *
 * Saída extra: scripts/manifests/mat_arquivos.json — a lista do que foi
 * gerado, para o teste e o deploy conferirem contagem sem reler a pasta.
 */

const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

const E = require('../src/services/exactSciencesService')

const RAIZ = path.resolve(__dirname, '..')
const DESTINO = path.join(RAIZ, 'src', 'commands', 'escola')
const MANIFESTO = path.join(RAIZ, 'scripts', 'manifests', 'mat_arquivos.json')
const DRY = process.argv.includes('--dry')

const PREFIXO = 'mat'
const CATEGORIA = 'escola'
const ALVO = 180
const LIMITE_DESCRICAO = 55
const SUBS = new Set(['Matemática', 'Física', 'Química'])

// Barrados por tests/formato-uso.test.js: o bot não desenha caixa.
const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
// "TODO"/"FIXME" só contam como marcador de código em CAIXA ALTA — em português
// "todo mundo" é frase comum, e a versão minúscula acusaria texto inocente.
const MARCADOR_DE_CODIGO = /\b(TODO|FIXME|XXX)\b/
const ENCHIMENTO = /(em breve|placeholder|lorem ipsum|texto de exemplo|indisponível no momento|conteúdo a definir)/i

/**
 * A tabela declarativa: um item por comando, na ordem em que o serviço
 * registrou os tópicos. `mat1` é o primeiro `T({...})` do serviço.
 * @type {Array<object>}
 */
const TABELA = E.listarTopicos().map(t => ({
    nome: `${PREFIXO}${t.indice}`,
    chave: t.chave,
    sub: t.sub,
    emoji: t.emoji,
    titulo: t.titulo,
    description: t.descricao,
    usage: t.usage,
    examples: t.examples
}))

// ─── Geração ────────────────────────────────────────────────────────────────

function arquivoDe(item) {
    return `/**
 * .${item.nome} — ${item.description}
 *
 * ${item.emoji} ${item.titulo}. Matéria: ${item.sub}.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "${item.chave}" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo \`node scripts/gen-matematica.js\` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = ${JSON.stringify(item.chave)}

module.exports = {
    name: ${JSON.stringify(item.nome)},
    aliases: [],
    category: ${JSON.stringify(CATEGORIA)},
    subcategory: ${JSON.stringify(item.sub)},
    description: ${JSON.stringify(item.description)},
    usage: ${JSON.stringify(item.usage)},
    examples: ${JSON.stringify(item.examples)},
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: ${JSON.stringify(item.nome)}, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
`
}

/** Confere a tabela antes de escrever: é aqui que a família se recusa a nascer torta. */
function validar() {
    const problemas = []
    const porSub = {}

    if (TABELA.length !== ALVO) problemas.push(`tabela tem ${TABELA.length} itens, esperado ${ALVO}`)

    const descricoes = new Map()
    const chaves = new Set()

    for (const item of TABELA) {
        porSub[item.sub] = (porSub[item.sub] || 0) + 1
        const id = item.nome

        if (!SUBS.has(item.sub)) problemas.push(`${id}: subcategoria "${item.sub}" fora da lista permitida`)

        if (!item.description) problemas.push(`${id}: sem description`)
        else {
            if (item.description.length > LIMITE_DESCRICAO) {
                problemas.push(`${id}: description com ${item.description.length} caracteres (máx. ${LIMITE_DESCRICAO}) → "${item.description}"`)
            }
            const antes = descricoes.get(item.description)
            if (antes) problemas.push(`${id}: description repetida de ${antes} → "${item.description}"`)
            else descricoes.set(item.description, id)
            if (CAIXA.test(item.description)) problemas.push(`${id}: description com caractere de caixa`)
        }

        if (chaves.has(item.chave)) problemas.push(`${id}: chave "${item.chave}" repetida`)
        chaves.add(item.chave)

        if (!item.usage) problemas.push(`${id}: sem usage`)
        if (!item.examples || !item.examples.length) problemas.push(`${id}: sem examples`)
    }

    return { problemas, porSub }
}

/** Roda cada tópico com os próprios exemplos: tela torta não vai para o disco. */
function conferirSaidas() {
    const F = require('../src/utils/formato')
    const problemas = []
    for (const item of TABELA) {
        const entradas = [[], ...item.examples.map(ex => String(ex).split(' — ')[0].trim().split(/\s+/))]
        for (const args of entradas) {
            let texto
            try {
                texto = F.tela(E.responder(item.chave, args, { comando: item.nome }))
            } catch (err) {
                problemas.push(`${item.nome} "${args.join(' ')}": estourou — ${err.message}`)
                continue
            }
            const rotulo = `${item.nome} "${args.join(' ')}"`
            if (texto.trim().length < 40) problemas.push(`${rotulo}: resposta curta demais (${texto.trim().length} caracteres)`)
            if (CAIXA.test(texto)) problemas.push(`${rotulo}: desenhou caixa`)
            if (MARCADOR_DE_CODIGO.test(texto)) problemas.push(`${rotulo}: marcador de código na resposta`)
            if (ENCHIMENTO.test(texto)) problemas.push(`${rotulo}: texto de enchimento`)
        }
    }
    return problemas
}

/**
 * Nome já usado por outra família derruba o boot. Carrega o registro inteiro e
 * só aceita colisão se o dono do nome for um arquivo nosso (regeração normal).
 */
function conferirColisoes() {
    const dispatcher = require('../src/handlers/commandDispatcher')
    dispatcher.loadCommands()
    const registro = dispatcher.getCommands()
    const colisoes = []
    for (const item of TABELA) {
        const dono = registro.get(item.nome)
        if (dono && !fs.existsSync(path.join(DESTINO, `${item.nome}.js`))) colisoes.push(item.nome)
    }
    return colisoes
}

/** Apaga só sobras `matN.js` acima do alvo. Arquivos `port*` nunca são tocados. */
function limparSobras(validos) {
    if (!fs.existsSync(DESTINO)) return []
    const re = new RegExp(`^${PREFIXO}\\d+\\.js$`)
    const sobras = fs.readdirSync(DESTINO).filter(nome => re.test(nome) && !validos.has(nome))
    for (const nome of sobras) fs.unlinkSync(path.join(DESTINO, nome))
    return sobras
}

function main() {
    const { problemas, porSub } = validar()

    console.log('📋 Tabela declarativa (tópicos de src/services/exactSciencesService.js):')
    for (const [sub, qtd] of Object.entries(porSub)) console.log(`   ${sub}: ${qtd}`)
    console.log(`   total: ${TABELA.length}`)

    if (problemas.length) {
        console.log('\n❌ Problemas na tabela:')
        problemas.slice(0, 20).forEach(p => console.log(`   • ${p}`))
        if (problemas.length > 20) console.log(`   … e mais ${problemas.length - 20}`)
        process.exit(1)
    }

    const saidas = conferirSaidas()
    if (saidas.length) {
        console.log('\n❌ Problemas na saída dos tópicos:')
        saidas.slice(0, 20).forEach(p => console.log(`   • ${p}`))
        if (saidas.length > 20) console.log(`   … e mais ${saidas.length - 20}`)
        process.exit(1)
    }
    console.log(`   saídas conferidas: ${TABELA.length} tópicos × (ajuda + exemplos)`)

    if (DRY) { console.log('\n✅ Tabela válida (modo --dry, nada gravado).'); return }

    const colisoes = conferirColisoes()
    if (colisoes.length) {
        console.log(`\n❌ Nomes já usados por outra família: ${colisoes.join(', ')}`)
        process.exit(1)
    }

    fs.mkdirSync(DESTINO, { recursive: true })
    fs.mkdirSync(path.dirname(MANIFESTO), { recursive: true })

    const gerados = []
    const validos = new Set()
    for (const item of TABELA) {
        const arquivo = path.join(DESTINO, `${item.nome}.js`)
        fs.writeFileSync(arquivo, arquivoDe(item))
        validos.add(`${item.nome}.js`)
        gerados.push({
            nome: item.nome,
            arquivo: path.relative(RAIZ, arquivo).replace(/\\/g, '/'),
            chave: item.chave,
            subcategory: item.sub,
            description: item.description
        })
    }

    const sobras = limparSobras(validos)
    if (sobras.length) console.log(`🧹 Sobras removidas: ${sobras.join(', ')}`)

    fs.writeFileSync(MANIFESTO, JSON.stringify({
        familia: 'escola — exatas',
        prefixo: PREFIXO,
        total: gerados.length,
        geradoPor: 'scripts/gen-matematica.js',
        servico: 'src/services/exactSciencesService.js',
        comandos: gerados
    }, null, 2) + '\n')

    console.log(`\n✅ ${gerados.length} comandos gravados em src/commands/${CATEGORIA}/`)
    console.log(`📄 Manifesto: ${path.relative(RAIZ, MANIFESTO)}`)
}

main()
