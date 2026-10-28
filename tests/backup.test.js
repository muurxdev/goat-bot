/**
 * BotXP — Suíte de Testes de Backup & Disaster Recovery (FASE 12)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const backupService = require('../src/services/backupService')
const dispatcher = require('../src/handlers/commandDispatcher')
const { createMockContext } = require('../src/dev/mockFactory')

console.log('🧪 Iniciando suíte de testes de Backup & Disaster Recovery (FASE 12)...\n')

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

async function runBackupTests() {
    dispatcher.loadCommands()

    // ══════════════════════════════════════════
    // 1. CRIAÇÃO DE SNAPSHOT & METADADOS
    // ══════════════════════════════════════════
    console.log('--- 1. Criação de Snapshot Hot Backup & Metadados ---')

    let createdBackup = null

    test('createBackup cria snapshot consistente e arquivo de metadados', () => {
        createdBackup = backupService.createBackup(5)

        assert(createdBackup !== null)
        assert(createdBackup.filename.startsWith('meliodas_backup_'))
        assert(createdBackup.sizeKb > 0)
        assert(typeof createdBackup.createdAt, 'string')
        assert(createdBackup.stats.users >= 0)

        const filePath = path.join(backupService.BACKUP_DIR, createdBackup.filename)
        assert(fs.existsSync(filePath), 'O arquivo .sqlite de backup deve existir')
    })

    // ══════════════════════════════════════════
    // 2. LISTAGEM & ROTAÇÃO DE BACKUPS
    // ══════════════════════════════════════════
    console.log('\n--- 2. Listagem e Rotação de Snapshots ---')

    test('listBackups lista backups ordenados por data decrescente', () => {
        const list = backupService.listBackups()
        assert(Array.isArray(list))
        assert(list.length >= 1)
        assert(list[0].filename.startsWith('meliodas_backup_'))
    })

    test('rotateBackups remove backups excedentes além do limite configurado', () => {
        // Gera mais 3 backups rápidos para forçar rotação
        backupService.createBackup(3)
        backupService.createBackup(3)
        backupService.createBackup(3)

        const list = backupService.listBackups()
        assert(list.length <= 3, 'Número de backups deve respeitar o teto de rotação (3)')
    })

    // ══════════════════════════════════════════
    // 3. RESTAURAÇÃO DE DADOS & SEGURANÇA
    // ══════════════════════════════════════════
    console.log('\n--- 3. Restauração & Proteção Pré-Restore ---')

    test('restoreBackup gera cópia de segurança e restaura base de dados', () => {
        const list = backupService.listBackups()
        const target = list[0].filename

        const res = backupService.restoreBackup(target)
        assert.strictEqual(res.restoredFrom, target)
        assert(res.safetyBackup.startsWith('pre_restore_safety_'))

        const safetyPath = path.join(backupService.BACKUP_DIR, res.safetyBackup)
        assert(fs.existsSync(safetyPath), 'Snapshot de segurança pré-restauração deve existir')
    })

    // ══════════════════════════════════════════
    // 4. COMANDOS DE OWNER (.backuplist e .backuprestore)
    // ══════════════════════════════════════════
    console.log('\n--- 4. Execução dos Comandos de Backup pelo Dono ---')

    await testAsync('dispatch executa .backuplist com sucesso para o Dono', async () => {
        const ctx = createMockContext('.backuplist', {
            sender: '5511999999999@s.whatsapp.net',
            isOwner: true
        })
        await dispatcher.dispatch(ctx)
        assert(ctx.capturedReplies.length >= 1)
        assert(ctx.capturedReplies[0].msg.includes('SNAPSHOTS DE BACKUP DISPONÍVEIS'))
    })

    await testAsync('dispatch bloqueia .backuplist para usuário comum', async () => {
        const ctx = createMockContext('.backuplist', {
            sender: '5511999880111@s.whatsapp.net',
            isOwner: false,
            isAdmin: false
        })
        await dispatcher.dispatch(ctx)
        assert(ctx.capturedReplies[0].msg.toLowerCase().includes('dono'))
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE BACKUP:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runBackupTests().catch(err => {
    console.error('Erro na execução dos testes de backup:', err)
    process.exit(1)
})
