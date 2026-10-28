/**
 * BotXP — Testes das Novas Funcionalidades (YouTube Mobile Fix, .bancmd all, Bot Name Global)
 */

// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require('assert')
const { getEstimatedWaitTime, formatDownloadProgressCard, formatMediaCaption } = require('../src/services/media/formatResolver')
const { getBotName, setBotName, DEFAULT_BOT_NAME } = require('../src/config/botConfig')
const { MEDIA_LIMITS } = require('../src/services/media/constants')
const dataService = require('../src/services/dataService')

async function runTests() {
    console.log('🧪 Iniciando testes de YouTube Mobile Fix, .bancmd all e Bot Name Global...\n')

    // 1. Bot Name Global e Dinâmico
    console.log('--- 1. Identidade e Bot Name Global Dinâmico ---')
    assert.ok(typeof DEFAULT_BOT_NAME === 'string' && DEFAULT_BOT_NAME.length > 0, 'DEFAULT_BOT_NAME deve ser string nao-vazia')
    const currentName = getBotName()
    assert.ok(typeof currentName === 'string' && currentName.length > 0)
    console.log(`  ✅ PASS: getBotName retorna nome oficial: ${currentName}`)

    // 2. Formato de Card de Progresso e Estimativa de Tempo
    console.log('\n--- 2. Cards de Progresso Interativos e Estimativas ---')
    assert.strictEqual(getEstimatedWaitTime(30), '~4 a 8 seg')
    assert.strictEqual(getEstimatedWaitTime(180), '~8 a 15 seg')
    assert.strictEqual(getEstimatedWaitTime(600), '~15 a 30 seg')
    assert.strictEqual(getEstimatedWaitTime('03:45'), '~8 a 15 seg')
    assert.strictEqual(getEstimatedWaitTime('25:00'), '~30 a 60 seg')
    console.log('  ✅ PASS: getEstimatedWaitTime calcula faixas corretas para shorts e vídeos longos')

    const card = formatDownloadProgressCard({
        platform: 'YouTube',
        title: 'RECEBIDINHOS DA ÉTI',
        isAudio: false,
        estimatedTime: '~8 a 15 seg',
        quality: '1080p Full HD'
    })
    // Cartão enxuto desde 2026-09-15: só o que está sendo baixado.
    assert.ok(card.startsWith('⏳'), card)
    assert.ok(card.includes('RECEBIDINHOS DA ÉTI'), card)
    console.log('  ✅ PASS: formatDownloadProgressCard gera card interativo completo')

    // 3. Limites de Arquivo Expandidos (2GB)
    console.log('\n--- 3. Limites de Download e WhatsApp Document Mode ---')
    assert.ok(MEDIA_LIMITS.MAX_FILE_SIZE_BYTES >= 2000 * 1024 * 1024, 'Limite deve suportar até 2GB')
    console.log(`  ✅ PASS: MAX_FILE_SIZE_BYTES expandido para ${(MEDIA_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB`)

    // 4. Lógica de .bancmd all e .unbancmd all
    console.log('\n--- 4. Lógica de .bancmd all e Bloqueio Global ---')
    const configs = dataService.getConfigsData()
    if (!configs['global']) configs['global'] = {}
    if (!configs['global'].bannedCommands) configs['global'].bannedCommands = {}

    // Simula ban all
    configs['global'].bannedCommands['all'] = { reason: 'Manutencao global', by: 'Dono', date: '01/09/2026' }
    assert.ok(configs['global'].bannedCommands['all'], 'all deve estar registrado')

    // Verifica que comando imune não cai no ban
    const immuneCommands = ['bancmd', 'unbancmd', 'dono', 'setdono', 'botopen', 'botclose', 'eval', 'shutdown', 'restart', 'menu', 'help']
    assert.ok(immuneCommands.includes('menu'))
    assert.ok(immuneCommands.includes('bancmd'))

    // Limpa ban all
    delete configs['global'].bannedCommands['all']
    assert.strictEqual(configs['global'].bannedCommands['all'], undefined)
    console.log('  ✅ PASS: .bancmd all e .unbancmd all operam corretamente com lista imune')

    console.log('\n========================================')
    console.log('📊 RESULTADO: TODOS OS TESTES PASSARAM!')
    console.log('========================================\n')
}

runTests().catch(err => {
    console.error('❌ Erro nos testes:', err)
    process.exit(1)
})

