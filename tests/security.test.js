/**
 * BotXP — Suíte de Testes de Owner & Security Core (ETAPA 2)
 * Valida Hierarquia de 5 Níveis, .up, .down, .bandm, .banstatus, .trust, Rate Limiter e Blacklist
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const path = require('path')
const fs = require('fs')

const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const securityRepo = require('../src/database/repositories/securityRepository')
const securityService = require('../src/services/securityService')
const { resolveUserRole, promoteUser, demoteUser, ROLES, permissionRepo } = require('../src/services/permissionService')
const dispatcher = require('../src/handlers/commandDispatcher')

console.log('🧪 Iniciando suíte de testes de Owner & Security Core (ETAPA 2)...\n')

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

async function runSecurityTests() {
    const db = getDatabase()
    runMigrations(db)
    dispatcher.loadCommands()

    // ══════════════════════════════════════════
    // 1. BLACKLIST GLOBAL (REPOSITÓRIO & SERVICE)
    // ══════════════════════════════════════════
    console.log('--- 1. Blacklist Global ---')

    test('Blacklist CRUD adiciona, verifica e remove usuário', () => {
        const testJid = '5511777777777@s.whatsapp.net'

        assert.strictEqual(securityService.isUserBanned(testJid), false)

        securityService.banUser(testJid, 'Spam abusivo', 'TestRunner')
        assert.strictEqual(securityService.isUserBanned(testJid), true)

        const bannedList = securityService.getBannedUsers()
        assert(bannedList.some(b => b.jid === testJid))

        securityService.unbanUser(testJid)
        assert.strictEqual(securityService.isUserBanned(testJid), false)
    })

    // ══════════════════════════════════════════
    // 2. ANTI-SPAM & RATE LIMITER
    // ══════════════════════════════════════════
    console.log('\n--- 2. Rate Limiting & Anti-Spam ---')

    test('checkRateLimit bloqueia após limite de requisições e isenta dono/trusted', () => {
        const spamUser = '5511666666666@s.whatsapp.net'

        for (let i = 0; i < 6; i++) {
            const check = securityService.checkRateLimit(spamUser, false, false)
            assert.strictEqual(check.blocked, false)
        }

        const spamCheck = securityService.checkRateLimit(spamUser, false, false)
        assert.strictEqual(spamCheck.blocked, true)
        assert(spamCheck.reason.includes('pausa'))

        const ownerCheck = securityService.checkRateLimit(spamUser, true, false)
        assert.strictEqual(ownerCheck.blocked, false)

        // Usuário TRUSTED possui tolerância 3x maior
        const trustedUser = '5511666667777@s.whatsapp.net'
        for (let i = 0; i < 15; i++) {
            const tCheck = securityService.checkRateLimit(trustedUser, false, true)
            assert.strictEqual(tCheck.blocked, false)
        }
    })

    test('sanitizeInput e checkMemoryHealth protegem o sistema contra injeção e sobrecarga', () => {
        const malicious = 'teste; rm -rf /; `curl evil.com` | cat < /etc/passwd'
        const sanitized = securityService.sanitizeInput(malicious)
        assert(!sanitized.includes(';'))
        assert(!sanitized.includes('`'))
        assert(!sanitized.includes('|'))
        assert(!sanitized.includes('<'))

        const memHealth = securityService.checkMemoryHealth(1024)
        assert.strictEqual(typeof memHealth.healthy, 'boolean')
        assert.strictEqual(typeof memHealth.rssMb, 'number')
    })

    // ══════════════════════════════════════════
    // 3. MODO MANUTENÇÃO & DISPATCHER INTERCEPTION
    // ══════════════════════════════════════════
    console.log('\n--- 3. Modo Manutenção & Dispatcher ---')

    test('Modo Manutenção ativa e desativa corretamente', () => {
        securityService.setMaintenance(true)
        assert.strictEqual(securityService.isMaintenanceActive(), true)

        securityService.setMaintenance(false)
        assert.strictEqual(securityService.isMaintenanceActive(), false)
    })

    await testAsync('dispatch bloqueia usuários banidos na blacklist', async () => {
        const bannedJid = '5511555555555@s.whatsapp.net'
        securityService.banUser(bannedJid, 'Teste ban', 'Admin')

        let replyMsg = ''
        const mockContext = {
            commandName: 'ping',
            sender: bannedJid,
            from: bannedJid,
            isGroup: false,
            isAdmin: false,
            isBotAdmin: false,
            isOwner: false,
            reply: async (txt) => { replyMsg = txt },
            args: []
        }

        const dispatched = await dispatcher.dispatch(mockContext)
        assert.strictEqual(dispatched, true)
        assert(replyMsg.includes('não pode mais usar meus comandos'))

        securityService.unbanUser(bannedJid)
    })

    // ══════════════════════════════════════════
    // 4. HIERARQUIA DE 5 NÍVEIS (ROLES)
    // ══════════════════════════════════════════
    console.log('\n--- 4. Hierarquia de 5 Níveis de Permissões ---')

    test('resolveUserRole mapeia corretamente os 5 níveis', () => {
        const ownerJid = '5511999999999@s.whatsapp.net'
        const normalJid = '5511111111111@s.whatsapp.net'
        const adminJid = '5511222222222@s.whatsapp.net'

        // 1. OWNER
        const roleOwner = resolveUserRole(ownerJid, false, true)
        assert.strictEqual(roleOwner.level, ROLES.OWNER)
        assert.strictEqual(roleOwner.name, 'OWNER')

        // 2. USER comum
        const roleUser = resolveUserRole(normalJid, false, false)
        assert.strictEqual(roleUser.level, ROLES.USER)
        assert.strictEqual(roleUser.name, 'USER')

        // 3. GROUP_ADMIN
        const roleGroupAdmin = resolveUserRole(adminJid, true, false)
        assert.strictEqual(roleGroupAdmin.level, ROLES.GROUP_ADMIN)
        assert.strictEqual(roleGroupAdmin.name, 'GROUP_ADMIN')

        // 4. Promovido a TRUSTED
        promoteUser(normalJid, 'TRUSTED', ownerJid, ROLES.OWNER)
        const roleTrusted = resolveUserRole(normalJid, false, false)
        assert.strictEqual(roleTrusted.level, ROLES.TRUSTED)
        assert.strictEqual(roleTrusted.name, 'TRUSTED')

        // 5. Promovido a BOT_ADMIN
        promoteUser(normalJid, 'BOT_ADMIN', ownerJid, ROLES.OWNER)
        const roleBotAdmin = resolveUserRole(normalJid, false, false)
        assert.strictEqual(roleBotAdmin.level, ROLES.BOT_ADMIN)
        assert.strictEqual(roleBotAdmin.name, 'BOT_ADMIN')

        // Limpeza
        demoteUser(normalJid, ownerJid, ROLES.OWNER)
        assert.strictEqual(resolveUserRole(normalJid, false, false).level, ROLES.USER)
    })

    test('promoteUser impede que BOT_ADMIN promova para OWNER ou BOT_ADMIN', () => {
        const botAdminJid = '5511888888888@s.whatsapp.net'
        const targetJid = '5511999990000@s.whatsapp.net'

        // BOT_ADMIN não pode nomear BOT_ADMIN
        assert.throws(() => {
            promoteUser(targetJid, 'BOT_ADMIN', botAdminJid, ROLES.BOT_ADMIN)
        }, /Somente o OWNER/)

        // BOT_ADMIN pode nomear TRUSTED
        const res = promoteUser(targetJid, 'TRUSTED', botAdminJid, ROLES.BOT_ADMIN)
        assert.strictEqual(res.role, 'TRUSTED')

        demoteUser(targetJid, botAdminJid, ROLES.BOT_ADMIN)
    })

    // ══════════════════════════════════════════
    // 5. COMANDOS .bandm, .banstatus, .trust
    // ══════════════════════════════════════════
    console.log('\n--- 5. Restrições de DM, Status e Trust ---')

    await testAsync('.bandm bloqueia e libera acesso à DM', async () => {
        const dmUser = '5511333333333@s.whatsapp.net'

        // 1. Bloqueia DM
        permissionRepo.setDmBlocked(dmUser, true, 'Spam no privado', 'OWNER')
        assert.strictEqual(permissionRepo.isDmBlocked(dmUser), true)

        // 2. Dispatcher bloqueia comando executado na DM
        let replyMsg = ''
        const mockDmContext = {
            commandName: 'ping',
            sender: dmUser,
            from: dmUser, // DM (não termina em @g.us)
            isGroup: false,
            isAdmin: false,
            isBotAdmin: false,
            isOwner: false,
            reply: async (txt) => { replyMsg = txt },
            args: []
        }

        const dispatched = await dispatcher.dispatch(mockDmContext)
        assert.strictEqual(dispatched, true)
        assert(replyMsg.toLowerCase().includes('dm') || replyMsg.toLowerCase().includes('privad') || replyMsg.toLowerCase().includes('bloquead') || replyMsg.toLowerCase().includes('restrito'))

        // 3. Desbloqueia DM
        permissionRepo.setDmBlocked(dmUser, false)
        assert.strictEqual(permissionRepo.isDmBlocked(dmUser), false)
    })

    test('.banstatus restringe e libera marcação de status no SQLite', () => {
        const statusUser = '5511222221111@s.whatsapp.net'

        assert.strictEqual(permissionRepo.isStatusBlocked(statusUser), false)
        permissionRepo.setStatusBlocked(statusUser, true, 'Marcação indevida', 'OWNER')
        assert.strictEqual(permissionRepo.isStatusBlocked(statusUser), true)

        permissionRepo.setStatusBlocked(statusUser, false)
        assert.strictEqual(permissionRepo.isStatusBlocked(statusUser), false)
    })

    test('.trust adiciona e remove da lista de confiança', () => {
        const trustedUser = '5511988887777@s.whatsapp.net'

        assert.strictEqual(permissionRepo.isTrusted(trustedUser), false)
        permissionRepo.setTrusted(trustedUser, true, 'OWNER', 'Dev confiável')
        assert.strictEqual(permissionRepo.isTrusted(trustedUser), true)

        const all = permissionRepo.getAllTrusted()
        assert(all.some(t => t.jid === trustedUser))

        permissionRepo.setTrusted(trustedUser, false)
        assert.strictEqual(permissionRepo.isTrusted(trustedUser), false)
    })

    // ══════════════════════════════════════════
    // 6. AVALIAÇÃO DE PERMISSÕES POR COMANDO (canExecuteCommand)
    // ══════════════════════════════════════════
    console.log('\n--- 6. Avaliação Centralizada de Permissões por Comando ---')

    test('canExecuteCommand avalia matriz de permissões com exatidão', () => {
        const { canExecuteCommand } = require('../src/services/permissionService')

        const ownerRole = { level: ROLES.OWNER, name: 'OWNER' }
        const botAdminRole = { level: ROLES.BOT_ADMIN, name: 'BOT_ADMIN' }
        const userRole = { level: ROLES.USER, name: 'USER' }

        // Comando ownerOnly
        const ownerCmd = { name: 'backup', ownerOnly: true }
        assert.strictEqual(canExecuteCommand(ownerRole, ownerCmd, { isGroup: true }).allowed, true)
        assert.strictEqual(canExecuteCommand(botAdminRole, ownerCmd, { isGroup: true }).allowed, false)
        assert.strictEqual(canExecuteCommand(userRole, ownerCmd, { isGroup: true }).allowed, false)

        // Comando minRole: BOT_ADMIN
        const botAdminCmd = { name: 'botclose', minRole: ROLES.BOT_ADMIN }
        assert.strictEqual(canExecuteCommand(ownerRole, botAdminCmd, { isGroup: true }).allowed, true)
        assert.strictEqual(canExecuteCommand(botAdminRole, botAdminCmd, { isGroup: true }).allowed, true)
        assert.strictEqual(canExecuteCommand(userRole, botAdminCmd, { isGroup: true }).allowed, false)

        // Comando groupOnly
        const groupCmd = { name: 'kick', groupOnly: true, adminOnly: true }
        assert.strictEqual(canExecuteCommand(ownerRole, groupCmd, { isGroup: false }).allowed, false)
        assert.strictEqual(canExecuteCommand(ownerRole, groupCmd, { isGroup: true }).allowed, true)
    })
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE SEGURANÇA & OWNER:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runSecurityTests().catch(err => {
    console.error('Erro na execução dos testes de segurança:', err)
    process.exit(1)
})
