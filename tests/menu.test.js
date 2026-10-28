/**
 * BotXP — Testes do menu auto-gerado (Fase 4)
 */

process.env.NODE_ENV = 'test'
process.env.STRICT_COMMANDS = '1'

const assert = require('assert')
const dispatcher = require('../src/handlers/commandDispatcher')
const { buildMenu } = require('../src/services/menuService')
const { CATEGORIES } = require('../src/config/categories')

dispatcher.loadCommands()
const reg = dispatcher.getCommands()

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log(`  ✅ PASS: ${name}`); pass++ }
    catch (e) { console.error(`  ❌ FAIL: ${name}\n     ${e.message}`); fail++ }
}

function listedFor(level) {
    const seen = new Set()
    for (const c of CATEGORIES) {
        let page = 1, tp = 1
        do {
            const m = buildMenu({ category: c.key, page, prefix: '.', userLevel: level, botName: 'B', registry: reg, totalAliases: 0 })
            tp = m.totalPages
            for (const mt of (m.pages[page - 1] || '').matchAll(/`\.([a-z0-9_\-\u00C0-\u00FF]+)`/gi)) {
                const n = mt[1].toLowerCase()
                if (reg.has(n)) seen.add(n)
            }
            page++
        } while (page <= tp)
    }
    return seen
}

console.log('🧪 Testes do menu auto-gerado (Fase 4)...\n')

test('OWNER vê 100% dos comandos do registro no menu', () => {
    const seen = listedFor(5)
    const missing = [...reg.keys()].filter(n => !seen.has(n))
    assert.strictEqual(missing.length, 0, `não listados: ${missing.slice(0, 10).join(', ')}`)
})

test('membro comum não vê comandos ownerOnly nem adminOnly', () => {
    const seen = listedFor(1)
    const leakedOwner = [...seen].filter(n => reg.get(n)?.ownerOnly)
    const leakedAdmin = [...seen].filter(n => reg.get(n)?.adminOnly)
    assert.strictEqual(leakedOwner.length, 0, `vazou owner: ${leakedOwner.join(', ')}`)
    assert.strictEqual(leakedAdmin.length, 0, `vazou admin: ${leakedAdmin.join(', ')}`)
})

test('página 1 (caption de mídia) nunca passa de 1024 chars (incluindo painel principal)', () => {
    for (const c of [...CATEGORIES.map(c => c.key), 'all', null]) {
        const m = buildMenu({ category: c, page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
        assert.ok(m.pages[0].length <= 1024, `${c || 'main'} pág1 = ${m.pages[0].length} chars`)
    }
})

test('painel principal cabe na legenda com o nome real do bot (letras estilizadas contam em dobro)', () => {
    // Com botName 'B' o painel cabia e com o nome de verdade passava de 1024.
    const nomeReal = 'ᶜᴿᴬᶻᵞ𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨✖️‿✖️•'
    const m = buildMenu({ category: null, page: 1, prefix: '.', userLevel: 5, botName: nomeReal, registry: reg, totalAliases: 0 })
    assert.ok(m.pages[0].length <= 1024, `painel com o nome real = ${m.pages[0].length} chars`)
})

test('toda caixa do menu abre e fecha na mesma página', () => {
    const { molduraQuebrada } = require('./helpers/moldura')
    for (const c of [...CATEGORIES.map(c => c.key), 'all', null]) {
        const m = buildMenu({ category: c, page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
        m.pages.forEach((p, i) => {
            const defeito = molduraQuebrada(p)
            assert.strictEqual(defeito, null, `${c || 'main'} pág${i + 1}: ${defeito}`)
        })
    }
})

test('legenda grande é dividida sem perder nada e sem quebrar caixa', () => {
    // O menu principal era cortado em 1.000 caracteres e a continuação não era
    // enviada: sumiam a área Extras e a navegação.
    const { dividirLegenda, LIMITE_LEGENDA } = require('../src/utils/wallpapers')
    const { molduraQuebrada } = require('./helpers/moldura')
    const linhas = Array.from({ length: 80 }, (_, i) => `┃ ➤ \`.cmd${i}\` — comando ${i}`)
    const texto = `╔══╗\n║ *X* ║\n╚══╝\n\n╭━〔 📂 LISTA 〕━⬣\n${linhas.join('\n')}\n╰━━━━━━━━━━━━━━━━━━⬣\n\n🔙 \`.menu\``
    const partes = dividirLegenda(texto)
    assert.strictEqual(partes.length, 2)
    assert.ok(partes[0].length <= LIMITE_LEGENDA, `legenda com ${partes[0].length}`)
    for (const p of partes) assert.strictEqual(molduraQuebrada(p), null, p.slice(0, 200))
    for (let i = 0; i < 80; i++) assert.ok(partes.some(p => p.includes(`\`.cmd${i}\``)), `.cmd${i} sumiu`)
    assert.ok(partes[1].includes('🔙 `.menu`'), 'a navegação do fim sumiu')
    assert.deepStrictEqual(dividirLegenda('curto'), ['curto'])
})

test('nenhuma página passa de 4096 chars (limite de texto)', () => {
    for (const c of [...CATEGORIES.map(c => c.key), 'all', null]) {
        const m = buildMenu({ category: c, page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
        m.pages.forEach((p, i) => assert.ok(p.length <= 4096, `${c || 'main'} pág${i + 1} = ${p.length} chars`))
    }
})

test('painel principal reúne todas as categorias sob 1024 caracteres na página 1 e atalhos na página 2', () => {
    const m1 = buildMenu({ category: null, page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
    assert.strictEqual(m1.totalPages, 2, 'Painel principal deve ter 2 páginas')
    assert.strictEqual(m1.page, 1)
    assert.ok(m1.pages[0].length <= 1024, `Página 1 deve ser <= 1024 chars, tem ${m1.pages[0].length}`)
    assert.ok(m1.pages[0].includes('.menu 2'))

    const m2 = buildMenu({ category: null, page: 2, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
    assert.strictEqual(m2.page, 2)
    assert.ok(m2.pages[1].length <= 1024, `Página 2 deve ser <= 1024 chars, tem ${m2.pages[1].length}`)
    assert.ok(m2.pages[1].includes('.menu 1'))

    // Toda categoria QUE TEM COMANDO precisa estar visível na página 1.
    // Área recém-criada e ainda vazia não entra: o painel pula categoria com
    // zero comandos de propósito (menuService: `if (count === 0) continue`),
    // para não oferecer uma porta que não abre nada.
    const { resolveModuleKey } = require('../src/config/modules')
    const comandosUnicos = [...new Set(reg.values())].filter(Boolean)
    const comComandos = new Set(comandosUnicos.map(cmd => resolveModuleKey(cmd)))
    for (const c of CATEGORIES) {
        if (!comComandos.has(c.key)) continue
        assert.ok(m1.pages[0].includes(`menu ${c.key}`), `falta categoria ${c.key} na página 1 do painel`)
    }
})

test('submenus respeitam o atalho digitado pelo usuário na navegação', () => {
    const mDono = buildMenu({ category: 'owner', requestedCategory: 'dono', page: 1, prefix: '.', userLevel: 5, botName: 'B', registry: reg, totalAliases: 0 })
    if (mDono.totalPages > 1) {
        assert.ok(mDono.pages[0].includes('.menu dono 2'), 'deve usar .menu dono 2 na navegação')
    }
})

console.log(`\n📊 Menu: ✅ ${pass}  ❌ ${fail}`)
if (fail > 0) process.exit(1)
