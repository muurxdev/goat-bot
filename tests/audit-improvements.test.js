// Banco de teste separado: sem isto o teste gravava no data/database.sqlite real
// (agendamentos de fechamento, usuários falsos).
process.env.NODE_ENV = 'test'
/**
 * Testes das Melhorias & Auditoria
 * Valida:
 * 1. Isolamento do Skycode em enableAll() e .modulo on all
 * 2. Comandos .rpg on/off e .pv on/off
 * 3. Contabilização de vitórias, derrotas e bosses no RPG
 * 4. Cache persistente de mídia (mediaCacheService)
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const moduleState = require('../src/services/moduleStateService')
const mediaCache = require('../src/services/media/mediaCacheService')
const dataService = require('../src/services/dataService')
const userRepository = require('../src/database/repositories/userRepository')

async function runAuditTests() {
    console.log('🧪 Iniciando testes de validação das melhorias...')

    // 1. ISOLAMENTO DO PROTOCOLO SKYCODE
    console.log('\n--- 1. Isolamento do Protocolo Skycode ---')
    const testScope = '120363999999999999@g.us'
    
    // enableAll não deve ativar skycode nem divulgacao
    moduleState.enableAll(testScope)
    assert.strictEqual(moduleState.isModuleEnabled('rpg', testScope), true, 'RPG deve estar ON após enableAll')
    assert.strictEqual(moduleState.isModuleEnabled('economia', testScope), true, 'Economia deve estar ON após enableAll')
    assert.strictEqual(moduleState.isModuleEnabled('skycode', testScope), false, 'Skycode DEVE PERMANECER FALSE após enableAll')
    assert.strictEqual(moduleState.isModuleEnabled('divulgacao', testScope), false, 'Divulgação DEVE PERMANECER FALSE após enableAll')
    console.log('  ✅ PASS: enableAll() ativa todos os módulos exceto skycode e divulgacao')

    // Ativação explícita de skycode
    moduleState.setModule('skycode', true, testScope)
    assert.strictEqual(moduleState.isModuleEnabled('skycode', testScope), true, 'Skycode deve estar ON após ativação explícita')
    console.log('  ✅ PASS: skycode ativa sob demanda explícita (.skycode on)')

    // 2. ISOLAMENTO DO ESCOPO PV
    console.log('\n--- 2. Controle do Privado (PV) ---')
    const pvScope = moduleState.PV_SCOPE
    moduleState.enableAll(pvScope)
    assert.strictEqual(moduleState.isModuleEnabled('rpg', pvScope), true, 'RPG deve estar ON no PV')
    assert.strictEqual(moduleState.isModuleEnabled('skycode', pvScope), false, 'Skycode NÃO deve ativar no PV por padrão')
    moduleState.disableAll(pvScope)
    assert.strictEqual(moduleState.isModuleEnabled('rpg', pvScope), false, 'RPG deve estar OFF após disableAll no PV')
    console.log('  ✅ PASS: .pv on e .pv off operam com isolamento de escopo')

    // 3. CACHE DE MÍDIA
    console.log('\n--- 3. Media Cache Service ---')
    const dummyFile = path.join(__dirname, 'dummy_media_test.mp3')
    fs.writeFileSync(dummyFile, 'DUMMY_AUDIO_DATA_TEST_12345', 'utf8')

    const cacheKey = 'https://www.youtube.com/watch?v=TEST_CACHE_KEY'
    const saved = mediaCache.set(cacheKey, 'mp3', 'default', dummyFile, {
        title: 'Música de Teste Cache',
        author: 'Artista Teste',
        durationFormatted: '03:15',
        mimeType: 'audio/mpeg'
    })
    assert.ok(saved, 'Arquivo deve ser salvo no cache')
    assert.ok(fs.existsSync(saved.filePath), 'Arquivo de cache deve existir em disco')

    const retrieved = mediaCache.get(cacheKey, 'mp3', 'default')
    assert.ok(retrieved, 'Item deve ser recuperado do cache')
    assert.strictEqual(retrieved.meta.title, 'Música de Teste Cache')
    assert.strictEqual(retrieved.size, fs.statSync(dummyFile).size)
    console.log('  ✅ PASS: mediaCacheService grava e recupera mídia instantaneamente do disco')

    // Limpa dummy
    try { fs.unlinkSync(dummyFile) } catch (_) {}

    // 4. PERSISTÊNCIA DO RPG E BOSSES
    console.log('\n--- 4. Contabilização do RPG & Dossiê ---')
    const testJid = '5511999990001@s.whatsapp.net'
    const user = {
        jid: testJid,
        name: 'Guerreiro Teste',
        wins: 10,
        losses: 2,
        bossesMortos: 5,
        registered: 1,
        displayNick: 'Guerreiro Teste',
        bossesResumo: { 'demonio_vermelho': { count: 3, nome: 'Demônio Vermelho' } }
    }
    userRepository.saveUser(user)

    const loaded = userRepository.getUser(testJid)
    assert.strictEqual(loaded.wins, 10, 'Wins deve persistir no banco')
    assert.strictEqual(loaded.losses, 2, 'Losses deve persistir no banco')
    assert.strictEqual(loaded.bossesMortos, 5, 'Bosses mortos deve persistir no banco')
    assert.strictEqual(loaded.registered, true, 'Registered deve persistir como boolean true')
    assert.ok(loaded.bossesResumo && loaded.bossesResumo.demonio_vermelho, 'Histórico de bosses deve persistir')
    console.log('  ✅ PASS: Vitórias, derrotas, bosses mortos e login persistidos no SQLite')

    console.log('\n========================================')
    console.log('📊 RESULTADO DOS TESTES DE MELHORIA: 100% OK')
    console.log('========================================\n')
}

runAuditTests().catch(err => {
    console.error('❌ Falha nos testes de melhoria:', err)
    process.exit(1)
})

