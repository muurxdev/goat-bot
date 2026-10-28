/**
 * Testes do motor de rankings (services/rankingService).
 *
 * O que precisa continuar verdadeiro:
 *  - Escopo: dentro de um grupo, o ranking lista só quem está naquele grupo.
 *    Foi a razão de o ranking global ter sido removido; se isso regredir, os
 *    43 comandos voltam a ser rankings globais sem ninguém perceber.
 *  - Nome de coluna nunca chega cru ao SQL (lista fechada).
 *  - Quem está fora do pódio vê a própria posição, contada no mesmo escopo.
 *  - Os 43 comandos da família carregam e respondem texto.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const path = require('path')
const { q, getDatabase } = require('../src/database/connection')
const R = require('../src/services/rankingService')

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}
async function testAsync(name, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes do motor de rankings...\n')

getDatabase()

// ── massa de teste: 6 jogadores com XP decrescente ──
const JIDS = []
for (let i = 0; i < 6; i++) {
    const jid = `rankteste${i}@s.whatsapp.net`
    JIDS.push(jid)
    q(`INSERT OR REPLACE INTO users (jid, name, display_nick, registered, xp, coins, wins, losses, guilda)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)`)
        .run(jid, `Teste${i}`, `Teste${i}`, (6 - i) * 1000, (6 - i) * 100, 10 - i, i + 1, i < 3 ? 'Alfa' : 'Beta')
}

const TODOS = { numeros: null, rotulo: 'entre todos os cadastrados' }
// grupo com apenas o 2º, 4º e 6º colocados
const GRUPO = { numeros: new Set(['rankteste1', 'rankteste3', 'rankteste5']), rotulo: 'neste grupo' }

test('ranking por coluna ordena do maior para o menor', () => {
    const doc = R.montarRanking({ coluna: 'xp', titulo: 'T', escopo: TODOS })
    const pos0 = doc.indexOf('Teste0'), pos1 = doc.indexOf('Teste1')
    assert.ok(pos0 > -1 && pos1 > -1, 'jogadores não apareceram')
    assert.ok(pos0 < pos1, 'Teste0 (mais XP) deveria vir antes de Teste1')
})

test('escopo de grupo exclui quem não é do grupo', () => {
    const doc = R.montarRanking({ coluna: 'xp', titulo: 'T', escopo: GRUPO })
    assert.ok(doc.includes('Teste1'), 'membro do grupo sumiu do ranking')
    assert.ok(!doc.includes('Teste0'), 'quem não é do grupo apareceu — escopo vazou')
    assert.ok(!doc.includes('Teste2'), 'quem não é do grupo apareceu — escopo vazou')
    assert.ok(doc.includes('neste grupo'), 'o rótulo do escopo não foi exibido')
})

test('numeroDe reduz JID, LID e sufixo de dispositivo ao mesmo número', () => {
    assert.strictEqual(R.numeroDe('5516997110418@s.whatsapp.net'), '5516997110418')
    assert.strictEqual(R.numeroDe('5516997110418:12@s.whatsapp.net'), '5516997110418')
    assert.strictEqual(R.numeroDe('42224477798582@lid'), '42224477798582')
})

test('escopo montado a partir de participantes com sufixo casa com o banco', () => {
    // É assim que resolverEscopo monta o conjunto: participante vem do WhatsApp
    // com ':12' colado, o banco guarda o JID limpo. Sem normalizar, o membro
    // sumia do próprio ranking do grupo dele.
    const participantes = [{ id: 'rankteste1:12@s.whatsapp.net' }, { id: 'rankteste3:4@s.whatsapp.net' }]
    const escopo = { numeros: new Set(participantes.map(p => R.numeroDe(p.id))), rotulo: 'neste grupo' }
    const doc = R.montarRanking({ coluna: 'xp', titulo: 'T', escopo })
    assert.ok(doc.includes('Teste1'), 'participante com sufixo :device sumiu do ranking')
    assert.ok(doc.includes('Teste3'), 'participante com sufixo :device sumiu do ranking')
    assert.ok(!doc.includes('Teste0'), 'escopo vazou')
})

test('posição própria aparece para quem ficou fora do pódio', () => {
    const doc = R.montarRanking({ coluna: 'xp', titulo: 'T', escopo: TODOS, senderJid: JIDS[5], limite: 3 })
    assert.ok(doc.includes('Sua posição'), 'quem está fora do pódio deveria ver a própria posição')
    assert.ok(!doc.includes('┃  4º'), 'o limite de 3 não foi respeitado')
})

test('posição própria NÃO aparece para quem já está no pódio', () => {
    const doc = R.montarRanking({ coluna: 'xp', titulo: 'T', escopo: TODOS, senderJid: JIDS[0], limite: 3 })
    assert.ok(!doc.includes('Sua posição'), 'quem lidera não deveria ver "Sua posição" repetida')
})

test('coluna fora da lista fechada é recusada, não interpolada no SQL', () => {
    const doc = R.montarRanking({ coluna: "xp; DROP TABLE users", titulo: 'T' })
    assert.ok(doc.includes('não é válida'), 'coluna arbitrária deveria ser recusada')
    const ainda = q('SELECT COUNT(*) AS n FROM users').get()
    assert.ok(ainda.n > 0, 'a tabela users sumiu — a coluna foi parar no SQL')
})

test('agrupamento recusa coluna não agrupável', () => {
    const doc = R.montarRankingAgrupado({ coluna: 'coins', titulo: 'T' })
    assert.ok(doc.includes('não é agrupável'), 'coluna numérica não deveria agrupar')
})

test('agrupamento soma população e XP por facção', () => {
    const doc = R.montarRankingAgrupado({ coluna: 'guilda', titulo: 'T', rotulo: 'membros', escopo: TODOS })
    assert.ok(/Alfa.*3 membros/.test(doc), 'guilda Alfa deveria ter 3 membros')
})

test('taxa exige mínimo de amostras', () => {
    const doc = R.montarRankingTaxa({ numerador: 'wins', denominadores: ['wins', 'losses'], minimo: 9999, titulo: 'T', escopo: TODOS })
    assert.ok(doc.includes('mínimo de 9999'), 'o piso de amostras não foi aplicado')
})

test('concordância de número no rótulo', () => {
    assert.strictEqual(R.montarRankingAgrupado({ coluna: 'guilda', titulo: 'T', rotulo: 'membros', escopo: { numeros: new Set(['rankteste0']), rotulo: 'x' } }).includes('1 membro ·'), true)
})

test('ranking vazio não quebra e explica o motivo', () => {
    const doc = R.montarRanking({ coluna: 'xp', titulo: 'T', escopo: { numeros: new Set(['ninguem']), rotulo: 'neste grupo' } })
    assert.ok(typeof doc === 'string' && doc.length > 0, 'ranking vazio retornou nada')
    assert.ok(doc.includes('Ninguém'), 'ranking vazio não explicou o motivo')
})

// ── os 43 comandos da família ──
;(async () => {
    await testAsync('os 43 comandos de ranking carregam e respondem texto', async () => {
        for (let i = 1; i <= 43; i++) {
            const arq = path.resolve(__dirname, '../src/commands/profile/perfilrank' + i + '.js')
            const cmd = require(arq)
            assert.ok(cmd.name, `perfilrank${i}.js sem name`)
            assert.strictEqual(typeof cmd.execute, 'function', `${cmd.name} sem execute`)
            let saida = null
            await cmd.execute({ reply: async t => { saida = t }, sender: JIDS[0], from: null, isGroup: false })
            assert.strictEqual(typeof saida, 'string', `${cmd.name} não respondeu texto`)
            assert.ok(saida.length > 0, `${cmd.name} respondeu vazio`)
            assert.ok(!saida.includes('❌'), `${cmd.name} respondeu com erro: ${saida.slice(0, 120)}`)
        }
    })

    // limpeza da massa de teste
    for (const jid of JIDS) q('DELETE FROM users WHERE jid = ?').run(jid)

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Rankings: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
