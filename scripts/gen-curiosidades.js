/**
 * Gerador da família CURIOSIDADES — `.curio1` … `.curio250`.
 *
 * Um comando por assunto da tabela de `src/services/curiosityData.js`, na ordem
 * em que os assuntos foram escritos. Escrever 250 arquivos à mão seria 250
 * chances de errar o schema; aqui a chance é uma, e ela é conferida antes de
 * qualquer gravação.
 *
 * O arquivo gerado não sabe nada: guarda a chave do assunto e entrega o resto
 * para `curiosityService.responder()`. Regra de consulta mora no serviço,
 * conteúdo mora nos dados, apresentação sai do F.tela.
 *
 * Uso:
 *   node scripts/gen-curiosidades.js          grava os arquivos e o manifesto
 *   node scripts/gen-curiosidades.js --dry    só confere a tabela e conta
 *
 * Saída extra: scripts/manifests/curio_arquivos.json — a lista do que foi
 * gerado, para o teste e o deploy conferirem contagem sem reler a pasta.
 */

const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

const C = require('../src/services/curiosityService')

const RAIZ = path.resolve(__dirname, '..')
const DESTINO = path.join(RAIZ, 'src', 'commands', 'curiosidades')
const MANIFESTO = path.join(RAIZ, 'scripts', 'manifests', 'curio_arquivos.json')
const DRY = process.argv.includes('--dry')

const ALVO = 250
const PREFIXO = 'curio'
const CATEGORIA = 'curiosidades'
const TETO_DESCRICAO = 55

/**
 * Monta a linha de comando que vira arquivo.
 * @param {number} indice 1 a 250
 * @param {object} tema tema cru de curiosityData
 */
function entradaDe(indice, tema) {
    const nome = `${PREFIXO}${indice}`
    const fichas = C.fichasDe(tema)
    const a = fichas[0]
    const b = fichas[1] || fichas[0]
    return {
        nome,
        tema: tema.chave,
        sub: tema.sub,
        description: tema.titulo,
        usage: '[nome do item | lista | buscar termo | comparar a, b]',
        examples: [
            `${a.chave} — abre a ficha de ${a.nome.toLowerCase()}`,
            `comparar ${a.chave}, ${b.chave} — põe as duas lado a lado`,
            'lista — mostra tudo que dá para consultar aqui'
        ],
        comentario: `${tema.titulo}: ${fichas.length} fichas consultáveis (${fichas.map(f => f.nome).join(', ')}).`
    }
}

/** O texto do arquivo de comando. */
function arquivoDe(item) {
    return `/**
 * .${item.nome} — ${item.description}
 *
 * ${item.comentario}
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo \`node scripts/gen-curiosidades.js\` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = ${JSON.stringify(item.tema)}

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
        const tela = C.responder(TEMA, { args, prefix, nome: ${JSON.stringify(item.nome)} })
        return reply(F.tela({ ...tela, prefix }))
    }
}
`
}

/** Confere a tabela e a lista de comandos antes de gravar qualquer coisa. */
function validar(entradas) {
    const problemas = C.conferir()

    if (entradas.length !== ALVO) {
        problemas.push(`a tabela rende ${entradas.length} comandos, e a família é de ${ALVO}`)
    }

    const descricoes = new Map()
    for (const item of entradas) {
        if (!item.description) problemas.push(`${item.nome}: sem description`)
        else if (item.description.length > TETO_DESCRICAO) {
            problemas.push(`${item.nome}: description com ${item.description.length} caracteres (máx. ${TETO_DESCRICAO}) → "${item.description}"`)
        }
        if (descricoes.has(item.description)) {
            problemas.push(`${item.nome} repete a description de ${descricoes.get(item.description)}: "${item.description}"`)
        }
        descricoes.set(item.description, item.nome)
        if (!C.SUBS.includes(item.sub)) problemas.push(`${item.nome}: subcategoria "${item.sub}" fora das seis aceitas`)
        if (!item.examples.length) problemas.push(`${item.nome}: sem exemplo`)
    }
    return problemas
}

/**
 * Nome único no projeto inteiro. Carrega o registro de comandos e recusa se
 * `curioN` já pertencer a outra família — o arquivo que já é nosso não conta.
 */
function conferirNomes(entradas) {
    const dispatcher = require('../src/handlers/commandDispatcher')
    dispatcher.loadCommands()
    const registro = dispatcher.getCommands()
    const colisoes = []
    for (const item of entradas) {
        const dono = registro.get(item.nome)
        const meu = fs.existsSync(path.join(DESTINO, `${item.nome}.js`))
        if (dono && !meu) colisoes.push(item.nome)
    }
    return colisoes
}

function main() {
    const conta = C.contagem()
    const entradas = C.TEMAS.map((tema, i) => entradaDe(i + 1, tema))

    console.log('📋 Tabela de curiosidades:')
    for (const [sub, n] of Object.entries(conta.porSub)) console.log(`   ${sub}: ${n} assuntos`)
    console.log(`   total: ${conta.temas} assuntos, ${conta.fichas} fichas`)

    const problemas = validar(entradas)
    if (problemas.length) {
        console.log(`\n❌ ${problemas.length} problema(s) na tabela:`)
        problemas.slice(0, 25).forEach(p => console.log(`   • ${p}`))
        process.exit(1)
    }

    if (DRY) { console.log('\n✅ Tabela válida (modo --dry, nada gravado).'); return }

    const colisoes = conferirNomes(entradas)
    if (colisoes.length) {
        console.log(`\n❌ Nomes já usados por outra família: ${colisoes.join(', ')}`)
        process.exit(1)
    }

    fs.mkdirSync(DESTINO, { recursive: true })
    fs.mkdirSync(path.dirname(MANIFESTO), { recursive: true })

    // Apaga sobra de uma geração anterior maior que a de agora.
    const esperados = new Set(entradas.map(e => `${e.nome}.js`))
    for (const arq of fs.readdirSync(DESTINO)) {
        if (/^curio\d+\.js$/.test(arq) && !esperados.has(arq)) fs.unlinkSync(path.join(DESTINO, arq))
    }

    const gerados = []
    for (const item of entradas) {
        const arquivo = path.join(DESTINO, `${item.nome}.js`)
        fs.writeFileSync(arquivo, arquivoDe(item))
        gerados.push({
            nome: item.nome,
            arquivo: path.relative(RAIZ, arquivo).replace(/\\/g, '/'),
            tema: item.tema,
            subcategory: item.sub,
            description: item.description,
            fichas: Object.keys(C.temaDe(item.tema).itens).length
        })
    }

    fs.writeFileSync(MANIFESTO, JSON.stringify({
        familia: 'curiosidades',
        prefixo: PREFIXO,
        total: gerados.length,
        fichas: conta.fichas,
        porSub: conta.porSub,
        geradoPor: 'scripts/gen-curiosidades.js',
        comandos: gerados
    }, null, 2) + '\n')

    console.log(`\n✅ ${gerados.length} comandos gravados em src/commands/${CATEGORIA}/`)
    console.log(`📄 Manifesto: ${path.relative(RAIZ, MANIFESTO)}`)
}

main()
