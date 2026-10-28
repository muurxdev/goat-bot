/**
 * BotXP — Suíte de Testes de Observability & Telemetria (FASE 11)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const telemetryService = require('../src/services/telemetryService')
const dispatcher = require('../src/handlers/commandDispatcher')
const { createMockContext } = require('../src/dev/mockFactory')

console.log('🧪 Iniciando suíte de testes de Observability & Telemetria (FASE 11)...\n')

let passCount = 0
let failCount = 0

function test(name, fn) {
    try {
        fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

async function testAsync(name, fn) {
    try {
        await fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

async function runTelemetryTests() {
    dispatcher.loadCommands()
    // Camada opt-in nasce OFF; libera tudo para testar o comportamento dos comandos.
    // Camada opt-in é POR AMBIENTE; libera os escopos usados nos testes.
    {
        const _ms = require('../src/services/moduleStateService')
        _ms.enableAll(_ms.PV_SCOPE)
        _ms.enableAll(_ms.GLOBAL_SCOPE)
        for (const g of ['5511999990001-1234@g.us', '120363000000000000@g.us', 'grupo@g.us']) _ms.enableAll(g)
    }
    telemetryService.resetMetrics()

    // ══════════════════════════════════════════
    // 1. TELEMETRY RECORDING & AGGREGATION
    // ══════════════════════════════════════════
    console.log('--- 1. Registro e Agregação de Telemetria ---')

    test('recordExecution calcula latências e taxas de sucesso corretamente', () => {
        telemetryService.recordExecution('ping', 10, true)
        telemetryService.recordExecution('ping', 20, true)
        telemetryService.recordExecution('play', 150, true)
        telemetryService.recordExecution('play', 50, false, new Error('Falha'))

        const summary = telemetryService.getMetricsSummary()
        assert.strictEqual(summary.totalExecutions, 4)
        assert.strictEqual(summary.successfulExecutions, 3)
        assert.strictEqual(summary.failedExecutions, 1)
        assert.strictEqual(summary.successRatePercent, 75.0)

        const top = telemetryService.getTopCommands(2)
        assert.strictEqual(top.length, 2)
        assert.strictEqual(top[0].name, 'ping')
        assert.strictEqual(top[0].avgLatencyMs, 15)
        assert.strictEqual(top[1].name, 'play')
        assert.strictEqual(top[1].errors, 1)
    })

    // ══════════════════════════════════════════
    // 2. HEALTHCHECK & INTEGRIDADE DE RECURSOS
    // ══════════════════════════════════════════
    console.log('\n--- 2. Healthcheck & Integridade do Host ---')

    test('getHealthReport avalia SQLite, memória e uptime com sucesso', () => {
        const report = telemetryService.getHealthReport()
        assert.strictEqual(report.status, 'HEALTHY')
        assert.strictEqual(report.sqlite.status, 'OK')
        assert(report.memory.rssMb > 0)
        assert(typeof report.system.uptime, 'string')
    })

    // ══════════════════════════════════════════
    // 3. EXECUÇÃO DE COMANDOS (.metrics e .health)
    // ══════════════════════════════════════════
    console.log('\n--- 3. Execução dos Comandos de Observabilidade ---')

    await testAsync('dispatch executa .metrics com permissão de administrador', async () => {
        const ctx = createMockContext('.metrics', {
            sender: '5511999999999@s.whatsapp.net',
            isOwner: true
        })
        await dispatcher.dispatch(ctx)
        assert(ctx.capturedReplies.length >= 1)
        assert(ctx.capturedReplies[0].msg.includes('TELEMETRIA & MÉTRICAS'))
    })

    await testAsync('dispatch executa .health para qualquer usuário', async () => {
        const ctx = createMockContext('.health', {
            sender: '5511999880111@s.whatsapp.net',
            isOwner: false,
            isAdmin: false
        })
        await dispatcher.dispatch(ctx)
        assert(ctx.capturedReplies.length >= 1)
        assert(/Estou funcionando bem|Estou com problema/i.test(ctx.capturedReplies[0].msg), ctx.capturedReplies[0].msg)
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE OBSERVABILITY:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runTelemetryTests().catch(err => {
    console.error('Erro na execução dos testes de telemetria:', err)
    process.exit(1)
})

