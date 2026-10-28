process.env.NODE_ENV = 'test'

/**
 * Regras corrigidas na rodada "bugs B":
 *  - daily: sequência recomeça depois de 48 h e XP sobe de nível
 *  - atividades (treinar) sobem de nível via adicionarXp
 *  - doacaogrupo recusa nova chuva com uma pendente e devolve a expirada
 *  - skillTreeService.pagas aceita lista, JSON e JSON de JSON
 *  - quizEngine não duplica emoji no título
 *  - formatCoins escreve "moedas"
 */

const assert = require('assert')
const { temTexto } = require('./helpers/moldura')
const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
runMigrations(getDatabase())

const dataService = require('../src/services/dataService')
const { calcularXpNecessario } = require('../src/services/xpService')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${nome}`); pass++ }
    catch (e) { console.error(`  ❌ FAIL: ${nome}\n     ${e.stack}`); fail++ }
}

function limpar(jid) {
    getDatabase().prepare('DELETE FROM users WHERE jid = ?').run(jid)
}

function preparar(jid, campos) {
    limpar(jid)
    const u = dataService.initializeUser(jid)
    Object.assign(u, campos)
    dataService.saveUser(u, { force: true })
    return u
}

function ctx(sender, extra = {}) {
    const saida = { textos: [] }
    return {
        saida,
        c: { sender, from: sender, prefix: '.', args: [], reply: async (t) => { saida.textos.push(String(t)) }, ...extra }
    }
}

;(async () => {
    console.log('🧪 Regras corrigidas (bugs B)...\n')
    const daily = require('../src/commands/profile/daily')
    const treinar = require('../src/commands/rpg/treinar')
    const doacao = require('../src/commands/economy/doacaogrupo')

    await test('daily: dentro de 48 h a sequência cresce', async () => {
        const jid = '5500000000101@s.whatsapp.net'
        preparar(jid, { lastDaily: Date.now() - 30 * 3600000, streak: 5 })
        const { c } = ctx(jid)
        await daily.execute(c)
        assert.strictEqual(dataService.getUser(jid).streak, 6)
        limpar(jid)
    })

    await test('daily: mais de 48 h sem resgatar volta a sequência para 1', async () => {
        const jid = '5500000000102@s.whatsapp.net'
        preparar(jid, { lastDaily: Date.now() - 72 * 3600000, streak: 9 })
        const { c } = ctx(jid)
        await daily.execute(c)
        assert.strictEqual(dataService.getUser(jid).streak, 1)
        limpar(jid)
    })

    await test('daily: XP que fecha o nível sobe de nível e mostra na tela', async () => {
        const jid = '5500000000103@s.whatsapp.net'
        preparar(jid, { level: 1, xp: calcularXpNecessario(1) - 1, lastDaily: 0, streak: 0 })
        const { c, saida } = ctx(jid)
        await daily.execute(c)
        const u = dataService.getUser(jid)
        assert.ok(u.level >= 2, `nível ficou ${u.level}`)
        assert.ok(temTexto(saida.textos.join('\n'), 'Subiu de nível'), 'tela sem "Subiu de nível"')
        limpar(jid)
    })

    await test('treinar: XP da atividade sobe de nível', async () => {
        const jid = '5500000000104@s.whatsapp.net'
        preparar(jid, { level: 1, xp: calcularXpNecessario(1) - 1 })
        const { c, saida } = ctx(jid)
        await treinar.execute(c)
        assert.ok(dataService.getUser(jid).level >= 2)
        assert.ok(temTexto(saida.textos.join('\n'), 'Subiu de nível'))
        limpar(jid)
    })

    await test('doacaogrupo: recusa nova chuva enquanto houver uma pendente, sem cobrar', async () => {
        const grupo = '120363000000000101@g.us'
        const doadorAntigo = '5500000000105@s.whatsapp.net'
        const jid = '5500000000106@s.whatsapp.net'
        preparar(jid, { coins: 5000 })
        const configs = dataService.getConfigsData()
        configs[grupo] = { ...(configs[grupo] || {}), pendingDrop: { amount: 700, sponsor: doadorAntigo, createdAt: Date.now() - 10 * 60000 } }
        await dataService.saveConfigsData({ [grupo]: configs[grupo] })

        const { c, saida } = ctx(jid, { from: grupo, args: ['1000'] })
        await doacao.execute(c)
        assert.strictEqual(dataService.getUser(jid).coins, 5000, 'cobrou mesmo recusando')
        assert.strictEqual(dataService.getConfigsData()[grupo].pendingDrop.sponsor, doadorAntigo, 'sobrescreveu a pendente')
        const tela = saida.textos.join('\n')
        assert.ok(temTexto(tela, 'Expira em'), 'tela sem validade')
        assert.ok(temTexto(tela, '700'), 'tela sem o valor pendente')
        limpar(jid)
    })

    await test('doacaogrupo: pendente expirada devolve as moedas ao doador e aceita a nova', async () => {
        const grupo = '120363000000000102@g.us'
        const doadorAntigo = '5500000000107@s.whatsapp.net'
        const jid = '5500000000108@s.whatsapp.net'
        preparar(doadorAntigo, { coins: 100 })
        preparar(jid, { coins: 5000 })
        await dataService.saveConfigsData({ [grupo]: { pendingDrop: { amount: 700, sponsor: doadorAntigo, createdAt: Date.now() - 2 * 3600000 } } })

        const { c } = ctx(jid, { from: grupo, args: ['1000'] })
        await doacao.execute(c)
        assert.strictEqual(dataService.getUser(doadorAntigo).coins, 800, 'não devolveu ao doador antigo')
        assert.strictEqual(dataService.getUser(jid).coins, 4000)
        const drop = dataService.getConfigsData()[grupo].pendingDrop
        assert.strictEqual(drop.sponsor, jid)
        assert.strictEqual(drop.amount, 1000)
        limpar(jid); limpar(doadorAntigo)
    })

    await test('skillTreeService.pagas aceita lista, JSON e JSON de JSON', () => {
        const { pagas } = require('../src/services/skillTreeService')
        const lista = ['furia', 'ataque']
        assert.deepStrictEqual(pagas({ skills: lista }), lista)
        assert.deepStrictEqual(pagas({ skills: JSON.stringify(lista) }), lista)
        assert.deepStrictEqual(pagas({ skills: JSON.stringify(JSON.stringify(lista)) }), lista)
        assert.deepStrictEqual(pagas({ skills: 'lixo' }), [])
        // Conferência por item: "ataque" não pode casar com "contraataque".
        assert.strictEqual(pagas({ skills: JSON.stringify(JSON.stringify(['contraataque'])) }).includes('ataque'), false)
    })

    await test('quizEngine: título com emoji não ganha 🧠 duplicado', async () => {
        const quiz = require('../src/services/quizEngine')
        const fn = quiz.questionDoc
        assert.ok(!fn('🎬 Quiz de cinema', { q: 'x', a: 'y' }).includes('🧠'))
        assert.ok(fn('Quiz geral', { q: 'x', a: 'y' }).includes('🧠 *Quiz geral*'))
    })

    await test('formatCoins escreve moedas', () => {
        const { formatCoins } = require('../src/utils/uiEngine')
        assert.strictEqual(formatCoins(200), '200 moedas')
        assert.strictEqual(formatCoins(1), '1 moeda')
    })

    console.log(`\n📊 Bugs B: ✅ ${pass}  ❌ ${fail}`)
    process.exit(fail > 0 ? 1 : 0)
})()
