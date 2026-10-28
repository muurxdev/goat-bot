/**
 * BotXP — Suíte de Testes do Bot Lifecycle Scheduler
 * Valida agendamentos persistentes em SQLite, parsing, recuperação de restart e permissões
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { temTexto } = require('./helpers/moldura')
const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const scheduleRepo = require('../src/database/repositories/scheduleRepository')
const botScheduler = require('../src/services/botScheduler')
const { createMockContext } = require('../src/dev/mockFactory')
const dispatcher = require('../src/handlers/commandDispatcher')

console.log('🧪 Iniciando suíte de testes do Bot Lifecycle Scheduler...\n')

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

async function runSchedulerTests() {
    const db = getDatabase()
    runMigrations(db)
    dispatcher.loadCommands()

    // ══════════════════════════════════════════
    // 1. PARSING DE DURAÇÕES E HORÁRIOS
    // ══════════════════════════════════════════
    console.log('--- 1. Parsing de Durações e Horários ---')

    test('parseDuration converte corretamente 30s, 10m, 2h e 1d', () => {
        assert.strictEqual(botScheduler.parseDuration('30s'), 30000)
        assert.strictEqual(botScheduler.parseDuration('10m'), 600000)
        assert.strictEqual(botScheduler.parseDuration('2h'), 7200000)
        assert.strictEqual(botScheduler.parseDuration('1d'), 86400000)

        assert.throws(() => botScheduler.parseDuration('-5m'), /(Duração|Unidade)/)
        assert.throws(() => botScheduler.parseDuration('0m'), /maior que zero/)
        assert.throws(() => botScheduler.parseDuration('abc'), /(Duração|Unidade)/)
    })

    test('parseTimeToTimestamp calcula timestamps válidos no futuro', () => {
        const ts23 = botScheduler.parseTimeToTimestamp('23:00')
        const ts07 = botScheduler.parseTimeToTimestamp('07:00')

        assert(ts23 > Date.now() - 60000, 'Timestamp 23:00 deve ser no presente ou futuro')
        assert(ts07 > Date.now() - 60000, 'Timestamp 07:00 deve ser no presente ou futuro')

        assert.throws(() => botScheduler.parseTimeToTimestamp('25:00'), /Horário inválido/)
        assert.throws(() => botScheduler.parseTimeToTimestamp('invalido'), /Horário inválido/)
    })

    // ══════════════════════════════════════════
    // 2. CICLO DE VIDA, FECHAMENTO E PERSISTÊNCIA
    // ══════════════════════════════════════════
    console.log('\n--- 2. Agendamentos de Fechamento e Reabertura no SQLite ---')

    test('scheduleCloseDuration cria agendamento e coloca bot em OFFLINE', () => {
        const res = botScheduler.scheduleCloseDuration('30m', 'OWNER')
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.OFFLINE)
        assert(res.reopenAt > Date.now())

        const active = scheduleRepo.getActiveSchedules()
        assert.strictEqual(active.length, 1)
        assert.strictEqual(active[0].mode, 'DURATION')
    })

    test('openImmediately reabre o bot e cancela fechamentos pendentes', () => {
        botScheduler.openImmediately('OWNER')
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.ONLINE)

        const active = scheduleRepo.getActiveSchedules()
        assert.strictEqual(active.length, 0)
    })

    test('scheduleCloseAtTime agenda fechamento futuro com reabertura', () => {
        const res = botScheduler.scheduleCloseAtTime('23:00', '07:00', 'OWNER')
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.SCHEDULED_CLOSE)
        assert(res.closeTimestamp > 0)
        assert(res.reopenTimestamp > res.closeTimestamp)

        const card = botScheduler.getScheduleStatusCard()
        assert(temTexto(card, 'BOT SCHEDULER'))
        assert(temTexto(card, 'AGENDADO PARA FECHAR') || temTexto(card, 'ONLINE'))
        assert(temTexto(card, 'FECHAR'))
    })

    test('cancelActiveSchedule remove agendamento e restaura ONLINE', () => {
        const cancelled = botScheduler.cancelActiveSchedule()
        assert.strictEqual(cancelled, true)
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.ONLINE)
    })

    // ══════════════════════════════════════════
    // 3. REINICIALIZAÇÃO & RESTART RECOVERY (VPS/PM2)
    // ══════════════════════════════════════════
    console.log('\n--- 3. Recuperação de Estado após Reinicialização do Processo ---')

    test('initScheduler restaura agendamento ativo e estado OFFLINE do SQLite', () => {
        const now = Date.now()
        scheduleRepo.cancelPendingSchedules()
        scheduleRepo.createSchedule({
            id: 'sched_restart_test',
            action: 'CLOSE',
            executeAt: now - 1000,
            reopenAt: now + 3600000, // Reabertura em 1h
            mode: 'DURATION',
            status: 'EXECUTING',
            createdBy: 'OWNER'
        })
        scheduleRepo.setOperationalState(botScheduler.BOT_STATES.OFFLINE)

        // Simula reinicialização do processo
        botScheduler.initScheduler()

        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.OFFLINE)

        // Limpeza
        botScheduler.openImmediately('OWNER')
    })

    // ══════════════════════════════════════════
    // 4. DISPATCHER & PROTEÇÃO CONTRA COMANDOS QUANDO OFFLINE
    // ══════════════════════════════════════════
    console.log('\n--- 4. Intercepção de Comandos Durante Estado OFFLINE ---')

    await testAsync('dispatcher bloqueia comandos de usuários comuns quando bot está OFFLINE', async () => {
        botScheduler.scheduleCloseDuration('1h', 'OWNER')

        const userCtx = createMockContext('.ping', {
            sender: '5511911113333@s.whatsapp.net',
            from: '120363000000000000@g.us',
            isOwner: false,
            isAdmin: false
        })

        const handledUser = await dispatcher.dispatch(userCtx)
        assert.strictEqual(handledUser, true)
        assert(userCtx.capturedReplies.length >= 1)
        assert(temTexto(userCtx.capturedReplies[0].msg, 'fechada'))

        // Dono consegue executar mesmo quando o bot está fechado para o público
        const ownerCtx = createMockContext('.ping', {
            sender: '5511999999999@s.whatsapp.net',
            from: '120363000000000000@g.us',
            isOwner: true,
            isAdmin: false
        })

        const handledOwner = await dispatcher.dispatch(ownerCtx)
        assert.strictEqual(handledOwner, true)
        assert(temTexto(ownerCtx.capturedReplies[0].msg, 'Pong') || temTexto(ownerCtx.capturedReplies[0].msg, 'Latência'))

        // Reabre o bot
        botScheduler.openImmediately('OWNER')
    })

    // ══════════════════════════════════════════
    // 5. PERMISSÕES DOS COMANDOS DO SCHEDULER
    // ══════════════════════════════════════════
    console.log('\n--- 5. Permissões de Acesso aos Comandos do Scheduler ---')

    await testAsync('usuário comum não pode executar .botclose nem .botopen', async () => {
        const normalUserCtx = createMockContext('.botclose 30m', {
            sender: '5511911114444@s.whatsapp.net',
            from: '120363000000000000@g.us',
            isOwner: false,
            isAdmin: false
        })

        await dispatcher.dispatch(normalUserCtx)
        assert(normalUserCtx.capturedReplies.length >= 1)
        assert(temTexto(normalUserCtx.capturedReplies[0].msg, 'precisa do cargo') || temTexto(normalUserCtx.capturedReplies[0].msg, 'hierarquia'))
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL & RESET
    // ══════════════════════════════════════════
    botScheduler.openImmediately('OWNER')

    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DO BOT SCHEDULER:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runSchedulerTests().catch(err => {
    console.error('Erro nos testes do bot scheduler:', err)
    process.exit(1)
})
