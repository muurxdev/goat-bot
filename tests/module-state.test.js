/**
 * Testes da camada opt-in POR AMBIENTE (moduleStateService + config/modules).
 * Garante: tudo OFF por padrão, isolamento entre grupo/PV, override por comando,
 * enableAll/disableAll por escopo, e o mapeamento comando→módulo.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const ms = require('../src/services/moduleStateService')
const { resolveModuleKey, MODULES } = require('../src/config/modules')

const G1 = '111111@g.us'
const G2 = '222222@g.us'
const PV = ms.PV_SCOPE

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes da camada opt-in por ambiente...\n')

// estado limpo
ms.disableAll(G1); ms.disableAll(G2); ms.disableAll(PV)

test('scopeOf resolve grupo e privado', () => {
    assert.strictEqual(ms.scopeOf('999@g.us', true), '999@g.us')
    assert.strictEqual(ms.scopeOf('5511@s.whatsapp.net', false), PV)
})

test('tudo OFF por padrão', () => {
    assert.strictEqual(ms.isModuleEnabled('cassino', G1), false)
    assert.strictEqual(ms.isCommandEnabled('slots', G1), false)
})

test('ligar módulo afeta SÓ aquele grupo', () => {
    ms.setModule('cassino', true, G1)
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }, G1), true, 'G1 deve ligar')
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }, G2), false, 'G2 não pode vazar')
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }, PV), false, 'PV não pode vazar')
})

test('enableAll no PV não vaza para grupos', () => {
    ms.enableAll(PV)
    assert.strictEqual(ms.isCommandEnabled({ name: 'ban', category: 'admin' }, PV), true)
    assert.strictEqual(ms.isCommandEnabled({ name: 'ban', category: 'admin' }, G1), false)
})

test('override por comando (ON) vence módulo OFF no mesmo escopo', () => {
    ms.setCommand('ban', true, G2)
    assert.strictEqual(ms.isCommandEnabled({ name: 'ban', category: 'admin' }, G2), true)
    assert.strictEqual(ms.isCommandEnabled({ name: 'ban', category: 'admin' }, G1), false)
})

test('override por comando (OFF) vence módulo ON', () => {
    ms.enableAll(G1)
    ms.setCommand('slots', false, G1)
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }, G1), false)
})

test('clearCommand devolve o comando ao módulo', () => {
    ms.clearCommand('slots', G1)
    assert.strictEqual(ms.isCommandEnabled({ name: 'slots', category: 'economy' }, G1), true)
})

test('disableAll desliga só o escopo alvo', () => {
    ms.disableAll(G1)
    for (const m of MODULES) assert.strictEqual(ms.isModuleEnabled(m.key, G1), false, 'módulo ' + m.key)
    assert.strictEqual(ms.isModuleEnabled('cassino', PV), true, 'PV segue ligado')
})

test('setModule com chave inválida falha graciosamente', () => {
    assert.strictEqual(ms.setModule('inexistente', true, G1).ok, false)
})

test('resolveModuleKey mapeia farms transversais', () => {
    assert.strictEqual(resolveModuleKey({ name: 'slots', category: 'economy' }), 'cassino')
    assert.strictEqual(resolveModuleKey({ name: 'welcome', category: 'admin' }), 'mensagens-grupo')
    assert.strictEqual(resolveModuleKey({ name: 'fig', category: 'media' }), 'figurinhas')
    assert.strictEqual(resolveModuleKey({ name: 'ban', category: 'admin' }), 'moderacao')
})

// deixa neutro
ms.disableAll(G1); ms.disableAll(G2); ms.disableAll(PV)

console.log('\n========================================')
console.log('📊 RESULTADO — Opt-in por ambiente:')
console.log('   ✅ Passaram: ' + pass)
console.log('   ❌ Falharam: ' + fail)
console.log('========================================')
if (fail > 0) process.exit(1)
