process.env.NODE_ENV = 'test'

/**
 * Peneira comum das famílias criadas na expansão de 2026-09-17.
 *
 * Cada família tem (ou terá) o seu teste próprio, que confere a conta e o
 * conteúdo. Aqui é a peneira que vale para TODAS: carregar, executar e exigir
 * resposta de gente — nada de tela vazia, de caixa desenhada ou de enchimento.
 *
 * Existe porque nem toda família chegou com teste: a do Reino foi para a
 * VPS antes do dela ficar pronto. Uma peneira única impede que isso vire buraco.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const FAMILIAS = [
    { prefixo: 'brit', pasta: 'rpg', categoria: 'rpg', nome: 'Reino' },
    { prefixo: 'txt', pasta: 'texto', categoria: 'texto', nome: 'Texto' },
    // Jogos: um arquivo por brincadeira (jogo-quiztema.js…) desde 2026-09-18; os
    // .jogoN antigos são atalhos de compatibilidade, os únicos permitidos aqui.
    { prefixo: 'jogo', pasta: 'fun', categoria: 'fun', nome: 'Jogos', padrao: /^jogo-[a-z]+\.js$/, atalhos: /^jogo\d+$/ },
    { prefixo: 'mat', pasta: 'escola', categoria: 'escola', nome: 'Matemática' },
    { prefixo: 'port', pasta: 'escola', categoria: 'escola', nome: 'Português' },
    { prefixo: 'ferr', pasta: 'ferramentas', categoria: 'ferramentas', nome: 'Ferramentas' },
    { prefixo: 'curio', pasta: 'curiosidades', categoria: 'curiosidades', nome: 'Curiosidades' }
]

// A moldura (╔═╗, ╭━〔 〕━⬣) precisa estar bem formada: tests/helpers/moldura.js.
const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const { molduraQuebrada, semTitulosDeMoldura } = require('./helpers/moldura')
// Duas listas de propósito: "TODO" e "FIXME" são marcadores de código e só
// valem em CAIXA ALTA — sem isso, "todo mundo aponta uma pessoa" era acusado de
// enchimento em 32 comandos. É a mesma armadilha do acento: regex em português
// pede cuidado com o que parece palavra inglesa.
const ENCHIMENTO = /\b(em breve|placeholder|lorem ipsum|texto de exemplo|indisponível no momento|conteúdo a definir)\b/i
const MARCADOR_DE_CODIGO = /\b(TODO|FIXME|XXX)\b/
const CHAVES_ACEITAS = new Set(['usage', 'examples', 'name', 'execute', 'aliases', 'category',
    'subcategory', 'description', 'cooldownMs', 'groupOnly', 'adminOnly', 'ownerOnly',
    'botAdminOnly', 'minRole', 'hidden', 'devOnly'])

const raiz = path.join(__dirname, '..')
let ok = 0, falhou = 0
const problemas = []

function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

/** Contexto falso: o comando responde aqui em vez de falar com o WhatsApp. */
function contextoFalso(saidas, args) {
    return {
        reply: t => { saidas.push(String(t ?? '')); return Promise.resolve() },
        args,
        text: args.join(' '),
        prefix: '.',
        from: '120363000000000000@g.us',
        sender: '5511900000001@s.whatsapp.net',
        isGroup: true,
        info: {},
        client: {}
    }
}

async function main() {
    console.log('\n🧪 Peneira das famílias novas...\n')

    const presentes = []
    for (const fam of FAMILIAS) {
        const dir = path.join(raiz, 'src', 'commands', fam.pasta)
        if (!fs.existsSync(dir)) continue
        const re = fam.padrao || new RegExp(`^${fam.prefixo}\\d+\\.js$`)
        const arquivos = fs.readdirSync(dir).filter(n => re.test(n))
        if (arquivos.length) presentes.push({ ...fam, dir, arquivos })
    }

    assert.ok(presentes.length > 0, 'nenhuma família nova encontrada')
    console.log(`  Famílias em disco: ${presentes.map(f => `${f.nome} (${f.arquivos.length})`).join(', ')}\n`)

    for (const fam of presentes) {
        const comandos = []

        teste(`${fam.nome}: todo arquivo carrega e segue o schema`, () => {
            for (const arq of fam.arquivos) {
                const cmd = require(path.join(fam.dir, arq))
                assert.ok(cmd && typeof cmd === 'object', `${arq} não exporta objeto`)
                assert.ok(typeof cmd.name === 'string' && cmd.name, `${arq} sem name`)
                assert.strictEqual(typeof cmd.execute, 'function', `${arq} sem execute`)
                assert.strictEqual(cmd.category, fam.categoria, `${arq}: categoria ${cmd.category} não bate com a pasta`)
                assert.ok(cmd.subcategory, `${arq} sem subcategory (some do menu)`)
                for (const chave of Object.keys(cmd)) {
                    assert.ok(CHAVES_ACEITAS.has(chave), `${arq}: chave "${chave}" fora do schema — derruba o boot em modo estrito`)
                }
                // O orçamento de aliases do projeto está esgotado: família nova não usa.
                const aliases = cmd.aliases || []
                if (fam.atalhos) {
                    // .jogoN e os atalhos herdados que o gerador registrou no manifesto
                    // (.hangman, .voceprefere, .dilema… de jogos antigos unificados).
                    const manifesto = require(path.join(raiz, 'scripts', 'manifests', 'jogo_arquivos.json'))
                    const herdados = new Set(manifesto.comandos.flatMap(c => c.atalhos || []))
                    const fora = aliases.filter(a => !fam.atalhos.test(a) && !herdados.has(a))
                    assert.strictEqual(fora.length, 0, `${arq}: alias fora da compatibilidade: ${fora.join(', ')}`)
                }
                else assert.ok(aliases.every(a => typeof a === 'string' && a && a !== cmd.name), `${arq} aliases inválidos`)
                assert.ok(cmd.description && cmd.description.length <= 55,
                    `${arq}: description com ${(cmd.description || '').length} caracteres (máx. 55, por causa do menu)`)
                comandos.push({ arq, cmd })
            }
        })

        teste(`${fam.nome}: nenhuma descrição repetida`, () => {
            const vistos = new Map()
            for (const { arq, cmd } of comandos) {
                const anterior = vistos.get(cmd.description)
                assert.ok(!anterior, `${arq} e ${anterior} têm a mesma descrição: "${cmd.description}"`)
                vistos.set(cmd.description, arq)
            }
        })

        // O teste que importa: o comando responde alguma coisa de verdade?
        const vazios = []
        const comCaixa = []
        const comEnchimento = []
        const quebrados = []
        for (const { arq, cmd } of comandos) {
            const saidas = []
            try {
                await cmd.execute(contextoFalso(saidas, []))
            } catch (err) {
                quebrados.push(`${arq}: ${err.message}`)
                continue
            }
            const texto = saidas.join('\n')
            if (texto.trim().length < 40) vazios.push(`${arq} (${texto.trim().length} caracteres)`)
            if (molduraQuebrada(texto)) comCaixa.push(arq)
            if (ENCHIMENTO.test(texto) || MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(texto))) comEnchimento.push(arq)
        }

        teste(`${fam.nome}: nenhum comando estoura ao rodar sem argumento`, () => {
            assert.strictEqual(quebrados.length, 0, `${quebrados.length} quebraram:\n     ${quebrados.slice(0, 5).join('\n     ')}`)
        })

        teste(`${fam.nome}: nenhum comando responde vazio`, () => {
            assert.strictEqual(vazios.length, 0, `${vazios.length} sem resposta de verdade:\n     ${vazios.slice(0, 5).join('\n     ')}`)
        })

        teste(`${fam.nome}: moldura bem formada na resposta`, () => {
            assert.strictEqual(comCaixa.length, 0, `${comCaixa.length} com moldura quebrada: ${comCaixa.slice(0, 5).join(', ')}`)
        })

        teste(`${fam.nome}: nenhuma resposta de enchimento`, () => {
            assert.strictEqual(comEnchimento.length, 0, `${comEnchimento.length} com texto de enchimento: ${comEnchimento.slice(0, 5).join(', ')}`)
        })

        if (problemas.length) console.log(problemas.join('\n'))
    }

    console.log(`\n📊 Famílias novas: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main()
