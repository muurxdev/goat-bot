/**
 * BotXP — Suíte de Testes do Live Progress Engine (ETAPA 4)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { renderProgressBar, formatProgressDashboard, ProgressSession, PROGRESS_STATES } = require('../src/services/progressEngine')

console.log('🧪 Iniciando suíte de testes do Live Progress Engine (ETAPA 4)...\n')

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

async function runProgressTests() {
    // ══════════════════════════════════════════
    // 1. RENDERIZADOR DE BARRA VISUAL UNICODE
    // ══════════════════════════════════════════
    console.log('--- 1. Renderização de Barras Visuais ---')

    test('renderProgressBar gera barras com proporções e porcentagens exatas', () => {
        const bar0 = renderProgressBar(0, 10)
        assert.strictEqual(bar0, '░░░░░░░░░░   0%')

        const bar50 = renderProgressBar(50, 10)
        assert.strictEqual(bar50, '█████░░░░░  50%')

        const bar72 = renderProgressBar(72, 10)
        assert.strictEqual(bar72, '███████░░░  72%')

        const bar100 = renderProgressBar(100, 10)
        assert.strictEqual(bar100, '██████████ 100%')
    })

    // ══════════════════════════════════════════
    // 2. FORMATAÇÃO DO DASHBOARD VISUAL
    // ══════════════════════════════════════════
    console.log('\n--- 2. Formatação do Card de Progresso ---')

    test('formatProgressDashboard inclui todas as 5 etapas e metadados', () => {
        const card = formatProgressDashboard({
            title: 'Música Exemplo',
            platform: 'YouTube',
            currentState: PROGRESS_STATES.DOWNLOAD,
            progressMap: { search: 100, analyze: 100, downloadPercent: 72 },
            eta: '00:18',
            currentSize: '48.2 MB',
            totalSize: '67.1 MB',
            speed: '3.5 MB/s'
        })

        assert(card.includes('PROCESSANDO MÍDIA'))
        assert(card.includes('Pesquisa'))
        assert(card.includes('Análise'))
        assert(card.includes('Download'))
        assert(card.includes('Processamento'))
        assert(card.includes('Upload'))
        assert(card.includes('00:18') && card.includes('ETA'))
        assert(card.includes('48.2 MB / 67.1 MB'))
        assert(card.includes('3.5 MB/s'))
    })

    // ══════════════════════════════════════════
    // 3. MÁQUINA DE ESTADOS DO PROGRESS SESSION
    // ══════════════════════════════════════════
    console.log('\n--- 3. Máquina de Estados do ProgressSession ---')

    await testAsync('ProgressSession transita por todos os estados de ponta a ponta', async () => {
        let sentMessages = []
        const mockClient = {
            sendMessage: async (to, content) => {
                sentMessages.push(content)
                return { key: { id: 'msg_123', remoteJid: to } }
            }
        }

        const session = new ProgressSession({
            client: mockClient,
            from: '120363000000000099@g.us',
            title: 'Teste de Vídeo',
            platform: 'TikTok',
            minUpdateIntervalMs: 0 // Sem delay nos testes
        })

        // 1. Search
        await session.setSearch(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.SEARCH)

        // 2. Analyze
        await session.setAnalyze(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.ANALYZE)

        // 3. Queue
        await session.setQueue(1)
        assert.strictEqual(session.currentState, PROGRESS_STATES.QUEUE)
        assert.strictEqual(session.eta, 'Fila #1')

        // 4. Download
        await session.setDownload(75, { eta: '00:10', currentSize: '15MB', totalSize: '20MB', speed: '2MB/s' })
        assert.strictEqual(session.currentState, PROGRESS_STATES.DOWNLOAD)
        assert.strictEqual(session.progressMap.download, 75)

        // 5. Process
        await session.setProcess(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.PROCESS)

        // 6. Upload
        await session.setUpload(100)
        assert.strictEqual(session.currentState, PROGRESS_STATES.UPLOAD)

        // 8. Cancelamento
        const cancelSession = new ProgressSession({
            client: mockClient,
            from: '120363000000000099@g.us',
            title: 'Mídia Cancelada',
            minUpdateIntervalMs: 0
        })
        await cancelSession.setCancel()
        assert.strictEqual(cancelSession.currentState, PROGRESS_STATES.CANCELLED)
        assert.strictEqual(cancelSession.isClosed, true)
    })

    test('ProgressSession calcula tempo decorrido e formata mm:ss', () => {
        const session = new ProgressSession({ title: 'Timer Test' })
        const elapsed = session.getElapsedFormatted()
        assert.match(elapsed, /^\d{2}:\d{2}$/)
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE PROGRESS ENGINE:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runProgressTests().catch(err => {
    console.error('Erro nos testes do progress engine:', err)
    process.exit(1)
})
