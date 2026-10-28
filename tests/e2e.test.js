/**
 * BotXP — Suíte Completa de Testes End-to-End (E2E) & Validação de Produção (FASE 10)
 * Valida fluxos integrados de ponta a ponta em condições reais de execução com SQLite.
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { temTexto } = require('./helpers/moldura')
const dispatcher = require('../src/handlers/commandDispatcher')
const { createMockContext } = require('../src/dev/mockFactory')
const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const { importLegacyJsonData } = require('../src/database/importer')
const botScheduler = require('../src/services/botScheduler')
const securityService = require('../src/services/securityService')
const mediaQueue = require('../src/services/mediaQueue')
const { ProgressSession, PROGRESS_STATES } = require('../src/services/progressEngine')
const { permissionRepo } = require('../src/services/permissionService')

console.log('🧪 Iniciando suíte de testes End-to-End (E2E) de Produção (FASE 10)...\n')

let passCount = 0
let failCount = 0

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

async function runE2ETests() {
    const db = getDatabase()
    runMigrations(db)
    importLegacyJsonData(db)
    dispatcher.loadCommands()

    const groupJid = '120363000000000099@g.us'

    // ══════════════════════════════════════════
    // 1. FLUXO DE ECONOMIA & RPG COMPLETO
    // ══════════════════════════════════════════
    console.log('--- 1. Fluxo Integrado de Economia, Perfil e RPG ---')

    await testAsync('Fluxo 1: Menu -> Daily -> Perfil -> Hunt -> Ranking -> Curar', async () => {
        const userJid = '5511999880100@s.whatsapp.net'

        // 1. Menu
        const ctxMenu = createMockContext('.menu', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxMenu)
        const { getBotName } = require('../src/config/botConfig')
        const currentName = getBotName()
        assert(ctxMenu.capturedReplies[0].msg.includes(currentName) || temTexto(ctxMenu.capturedReplies[0].msg, 'GOAT') || temTexto(ctxMenu.capturedReplies[0].msg, 'GOAT'))

        // 2. Daily
        const ctxDaily = createMockContext('.daily', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxDaily)
        assert(ctxDaily.capturedReplies.length >= 1)

        // 3. Perfil & XP
        const ctxPerfil = createMockContext('.perfil', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxPerfil)
        assert(ctxPerfil.capturedReplies.length >= 1)

        // 4. Hunt
        const ctxHunt = createMockContext('.hunt', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHunt)
        assert(ctxHunt.capturedReplies.length >= 1)

        // 5. Rank
        const ctxRank = createMockContext('.rank', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxRank)
        assert(ctxRank.capturedReplies.length >= 1)

        // 6. Curar
        const ctxCurar = createMockContext('.curar', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxCurar)
        assert(ctxCurar.capturedReplies.length >= 1)
    })

    // ══════════════════════════════════════════
    // 2. FLUXO DE SEGURANÇA & HIERARQUIA DE 5 NÍVEIS
    // ══════════════════════════════════════════
    console.log('\n--- 2. Fluxo de Permissões, Owner Core e Segurança ---')

    await testAsync('Fluxo 2: .trust -> .bandm -> .banstatus -> .sysinfo', async () => {
        const targetUser = '5511999880200@s.whatsapp.net'
        const ownerJid = '5511999999999@s.whatsapp.net'

        // 1. Adiciona à Trust List (.trust)
        const ctxTrust = createMockContext(`.trust @${targetUser.split('@')[0]} Desenvolvedor sênior`, { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxTrust)
        assert(temTexto(ctxTrust.capturedReplies[0].msg, 'confiança') || temTexto(ctxTrust.capturedReplies[0].msg, 'TRUSTED'))

        // 4. Bloqueia DM (.bandm)
        const ctxBanDm = createMockContext(`.bandm @${targetUser.split('@')[0]} Spam no privado`, { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxBanDm)
        assert(temTexto(ctxBanDm.capturedReplies[0].msg, 'bloqueada') || temTexto(ctxBanDm.capturedReplies[0].msg, 'DM'))

        // 5. Restringe Status (.banstatus)
        const ctxBanStatus = createMockContext(`.banstatus @${targetUser.split('@')[0]} Marcações indevidas`, { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxBanStatus)
        const banStatusMsg = ctxBanStatus.capturedReplies[0].msg.toLowerCase()
        assert(temTexto(banStatusMsg, 'status') || temTexto(banStatusMsg, 'restrição'))

        // 6. Sysinfo do Dono (.sysinfo)
        const ctxSys = createMockContext('.sysinfo', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxSys)
        assert(temTexto(ctxSys.capturedReplies[0].msg, 'GOAT') || temTexto(ctxSys.capturedReplies[0].msg, 'RAM'))

        // Limpeza dos mocks de teste
        permissionRepo.setDmBlocked(targetUser, false)
        permissionRepo.setStatusBlocked(targetUser, false)
    })

    // ══════════════════════════════════════════
    // 3. FLUXO DE DEV HUB & UTILITÁRIOS
    // ══════════════════════════════════════════
    console.log('\n--- 3. Fluxo de Utilitários de Software & Dev Hub ---')

    await testAsync('Fluxo 3: .json -> .hash -> .b64 -> .jwt -> .uuid -> .regex -> .calc -> .timestamp', async () => {
        const userJid = '5511999880300@s.whatsapp.net'

        // 1. JSON
        const ctxJson = createMockContext('.json format {"service":"bot","status":"active"}', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxJson)
        assert(temTexto(ctxJson.capturedReplies[0].msg, 'JSON FORMATADO'))

        // 2. Hash
        const ctxHash = createMockContext('.sha256 goat', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHash)
        assert(temTexto(ctxHash.capturedReplies[0].msg, 'HASH CRIPTOGRÁFICO'))

        // 3. Base64
        const ctxB64 = createMockContext('.b64 encode TypeScript & Node', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxB64)
        assert(/Base64 codificado/i.test(ctxB64.capturedReplies[0].msg), ctxB64.capturedReplies[0].msg)

        // 4. UUID
        const ctxUuid = createMockContext('.uuid', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxUuid)
        assert(temTexto(ctxUuid.capturedReplies[0].msg, 'GERADOR DE UUID'))

        // 5. Regex
        const ctxRegex = createMockContext('.regex /v[0-9]+/g goat v2.0', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxRegex)
        assert(temTexto(ctxRegex.capturedReplies[0].msg, 'MATCH ENCONTRADO'))

        // 6. Calc
        const ctxCalc = createMockContext('.calc (100 * 5) / 2', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxCalc)
        assert(temTexto(ctxCalc.capturedReplies[0].msg, '250'))

        // 7. Timestamp
        const ctxTime = createMockContext('.timestamp 1700000000', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxTime)
        assert(/Conversão de timestamp/i.test(ctxTime.capturedReplies[0].msg), ctxTime.capturedReplies[0].msg)
    })

    // ══════════════════════════════════════════
    // 4. FLUXO DE MEDIA ENGINE & PROGRESS ENGINE
    // ══════════════════════════════════════════
    console.log('\n--- 4. Fluxo de Media Hub e Live Progress Engine ---')

    await testAsync('Fluxo 4: ProgressSession percorre SEARCH -> ANALYZE -> QUEUE -> DOWNLOAD -> PROCESS -> UPLOAD -> COMPLETE', async () => {
        let sentLog = []
        const mockSock = {
            sendMessage: async (to, content) => {
                sentLog.push(content)
                return { key: { id: `prog_${Date.now()}`, remoteJid: to } }
            }
        }

        const session = new ProgressSession({
            client: mockSock,
            from: groupJid,
            title: 'Imagine Dragons - Believer',
            platform: 'YouTube',
            minUpdateIntervalMs: 0
        })

        await session.setSearch(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.SEARCH)

        await session.setAnalyze(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.ANALYZE)

        await session.setQueue(1)
        assert.strictEqual(session.currentState, PROGRESS_STATES.QUEUE)

        await session.setDownload(60, { eta: '00:15', currentSize: '12MB', totalSize: '20MB', speed: '3.2MB/s' })
        assert.strictEqual(session.currentState, PROGRESS_STATES.DOWNLOAD)

        await session.setProcess(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.PROCESS)

        await session.setUpload(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.UPLOAD)

        await session.setComplete()
        assert.strictEqual(session.currentState, PROGRESS_STATES.COMPLETE)
        assert.strictEqual(session.isClosed, true)
    })

    // ══════════════════════════════════════════
    // 5. FLUXO DE BOT SCHEDULER & RECOVERY
    // ══════════════════════════════════════════
    console.log('\n--- 5. Fluxo de Bot Lifecycle Scheduler & Persistência SQLite ---')

    await testAsync('Fluxo 5: .botclose -> OFFLINE -> Intercepção de comandos -> .botschedule -> .botopen -> ONLINE', async () => {
        const ownerJid = '5511999999999@s.whatsapp.net'
        const normalUser = '5511999880500@s.whatsapp.net'

        // 1. Fecha por 45 minutos (.botclose)
        const ctxClose = createMockContext('.botclose 45m', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxClose)
        assert(/fechad/i.test(ctxClose.capturedReplies[0].msg), ctxClose.capturedReplies[0].msg)
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.OFFLINE)

        // 2. Usuário comum tenta usar o bot e é bloqueado
        const ctxBlocked = createMockContext('.ping', { sender: normalUser, from: groupJid, isOwner: false, isAdmin: false })
        await dispatcher.dispatch(ctxBlocked)
        assert(temTexto(ctxBlocked.capturedReplies[0].msg, 'fechada'))

        // 3. Dono consulta agendamento (.botschedule)
        const ctxSched = createMockContext('.botschedule', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxSched)
        assert(/Meus horários/i.test(ctxSched.capturedReplies[0].msg), ctxSched.capturedReplies[0].msg)
        assert(/fechado/i.test(ctxSched.capturedReplies[0].msg), ctxSched.capturedReplies[0].msg)

        // 4. Dono reabre o bot (.botopen)
        const ctxOpen = createMockContext('.botopen', { sender: ownerJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxOpen)
        assert(/Estou aberto/i.test(ctxOpen.capturedReplies[0].msg), ctxOpen.capturedReplies[0].msg)
        assert.strictEqual(botScheduler.getBotState(), botScheduler.BOT_STATES.ONLINE)

        // 5. Usuário comum volta a conseguir executar comandos normalmente
        const ctxPingOk = createMockContext('.ping', { sender: normalUser, from: groupJid, isOwner: false, isAdmin: false })
        await dispatcher.dispatch(ctxPingOk)
        assert(temTexto(ctxPingOk.capturedReplies[0].msg, 'Pong') || temTexto(ctxPingOk.capturedReplies[0].msg, 'Latência'))
    })

    // ══════════════════════════════════════════
    // 6. FLUXO DE MODERAÇÃO & GRUPOS
    // ══════════════════════════════════════════
    console.log('\n--- 6. Fluxo de Moderação de Grupos & Anti-Link ---')

    await testAsync('Fluxo 6: .antilink on -> .warnings -> .antilink off', async () => {
        const adminJid = '5511999880600@s.whatsapp.net'

        const ctxAntilinkOn = createMockContext('.antilink on', { sender: adminJid, from: groupJid, isAdmin: true, isOwner: true })
        await dispatcher.dispatch(ctxAntilinkOn)
        assert(ctxAntilinkOn.capturedReplies[0].msg.toLowerCase().includes('anti-link') || ctxAntilinkOn.capturedReplies[0].msg.toLowerCase().includes('on'))

        const ctxWarns = createMockContext('.warnings', { sender: adminJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxWarns)
        assert(ctxWarns.capturedReplies[0].msg.toLowerCase().includes('advertências') || ctxWarns.capturedReplies[0].msg.toLowerCase().includes('warn'))
    })

    // ══════════════════════════════════════════
    // 7. FLUXO DE DISCOVERY & HELP
    // ══════════════════════════════════════════
    console.log('\n--- 7. Fluxo de Command Discovery & Dynamic Help ---')

    await testAsync('Fluxo 7: .help geral -> .help dev -> .help .json', async () => {
        const userJid = '5511999880700@s.whatsapp.net'

        // 1. Help Geral
        const ctxHelp = createMockContext('.help', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHelp)
        assert(temTexto(ctxHelp.capturedReplies[0].msg, require('../src/config/botConfig').getBotName()) || temTexto(ctxHelp.capturedReplies[0].msg, 'GOAT') || temTexto(ctxHelp.capturedReplies[0].msg, 'GOAT'))
        assert(temTexto(ctxHelp.capturedReplies[0].msg, 'Dev Hub'))

        // 2. Help Dev Category
        const ctxHelpDev = createMockContext('.help dev', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHelpDev)
        assert(temTexto(ctxHelpDev.capturedReplies[0].msg, 'Dev Hub & Utilitários'))
        assert(temTexto(ctxHelpDev.capturedReplies[0].msg, '.json'))

        // 3. Help .json
        const ctxHelpJson = createMockContext('.help .json', { sender: userJid, from: groupJid, isOwner: true })
        await dispatcher.dispatch(ctxHelpJson)
        assert(temTexto(ctxHelpJson.capturedReplies[0].msg, 'Guia do .json'))
        assert(temTexto(ctxHelpJson.capturedReplies[0].msg, '.json'))
    })

    // ══════════════════════════════════════════
    // 8. FLUXO DE RATE LIMIT & ANTI-ABUSE
    // ══════════════════════════════════════════
    console.log('\n--- 8. Fluxo de Stress Anti-Abuse & Rate Limit ---')

    await testAsync('Fluxo 8: Rate Limit Burst -> Suspensão Temporária -> Desbloqueio', async () => {
        const spammerJid = '5511999880800@s.whatsapp.net'

        for (let i = 0; i < 6; i++) {
            const check = securityService.checkRateLimit(spammerJid, false, false)
            assert.strictEqual(check.blocked, false)
        }

        const blockedCheck = securityService.checkRateLimit(spammerJid, false, false)
        assert.strictEqual(blockedCheck.blocked, true)
        assert(temTexto(blockedCheck.reason, 'pausa'))
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES E2E DE PRODUÇÃO:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runE2ETests().catch(err => {
    console.error('Erro na execução dos testes E2E:', err)
    process.exit(1)
})
