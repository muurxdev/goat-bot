/**
 * BotXP — Testes de integridade do registro de comandos (Fase 3)
 *
 * Roda em modo estrito (STRICT_COMMANDS=1): falha o boot se houver nomes
 * duplicados ou campos obrigatórios ausentes. Também trava um teto para
 * aliases mortos/conflitos, para que a situação nunca regrida silenciosamente.
 */

process.env.NODE_ENV = 'test'
process.env.STRICT_COMMANDS = '1'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const dispatcher = require('../src/handlers/commandDispatcher')

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log(`  ✅ PASS: ${name}`); pass++ }
    catch (e) { console.error(`  ❌ FAIL: ${name}\n     ${e.message}`); fail++ }
}

console.log('🧪 Testes de integridade do dispatcher (Fase 3)...\n')

test('loadCommands não lança em modo estrito (0 erros de registro)', () => {
    assert.doesNotThrow(() => dispatcher.loadCommands())
})

const report = dispatcher.getValidationReport()

test('nenhum nome de comando duplicado', () => {
    assert.strictEqual(report.duplicateNames.length, 0,
        `duplicados: ${report.duplicateNames.map(d => d.name).join(', ')}`)
})

test('nenhum campo obrigatório ausente (name + execute)', () => {
    assert.strictEqual(report.missingFields.length, 0,
        report.missingFields.map(m => `${m.file}: ${m.reason}`).join(' | '))
})

test('nenhuma chave desconhecida no schema de comando', () => {
    assert.strictEqual(report.unknownKeys.length, 0,
        report.unknownKeys.map(u => `${u.name}.${u.key}`).join(', '))
})

test('todo arquivo em src/commands exporta name + execute', () => {
    const dir = path.join(__dirname, '..', 'src', 'commands')
    const offenders = []
    const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name)
            if (e.isDirectory()) walk(p)
            else if (e.name.endsWith('.js')) {
                const cmd = require(p)
                if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
                    offenders.push(path.relative(dir, p))
                }
            }
        }
    }
    walk(dir)
    assert.strictEqual(offenders.length, 0, `sem name/execute: ${offenders.join(', ')}`)
})

test('teto de aliases mortos não regride (<= 33)', () => {
    // Baseline após remoção dos 289 stubs: 31.
    assert.ok(report.aliasShadowedByName.length <= 33,
        `aliases mortos subiu para ${report.aliasShadowedByName.length}`)
})

test('teto de aliases em conflito não regride (<= 63)', () => {
    // Baseline pós-limpeza: 62.
    assert.ok(report.aliasConflicts.length <= 63,
        `aliases em conflito subiu para ${report.aliasConflicts.length}`)
})

test('colisões críticas resolvidas: .ban=admin, .bingo=economy, .banglobal=owner', () => {
    const cmds = dispatcher.getCommands()
    assert.strictEqual(cmds.get('ban')?.category, 'admin', '.ban deve ser admin (kick de grupo)')
    assert.strictEqual(cmds.get('bingo')?.category, 'economy', '.bingo deve ser o gerador real (economy)')
    assert.ok(cmds.has('banglobal'), '.banglobal deve existir (owner)')
    assert.strictEqual(cmds.get('banglobal')?.ownerOnly, true)
})

console.log(`\n📊 Integridade: ✅ ${pass}  ❌ ${fail}`)
if (fail > 0) process.exit(1)
