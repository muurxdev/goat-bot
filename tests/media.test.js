/**
 * BotXP — Suíte de Testes do Media Engine Multiplataforma (FASE 3)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const { addExif } = require('../src/utils/stickerUtils')
const { limparArquivosTemporarios } = require('../src/services/mediaService')
const {
    mediaEngine,
    validateUrl,
    detectPlatform,
    normalizeUrl,
    formatDuration,
    formatSearchResults,
    resolveDownloadFormat,
    PLATFORMS,
    FORMATS,
    QUALITIES,
    MEDIA_ERRORS
} = require('../src/services/media/mediaEngine')
const { MediaQueue } = require('../src/services/mediaQueue')
const { tempDir } = require('../src/config/paths')

console.log('🧪 Iniciando suíte de testes do Media Engine Multiplataforma (FASE 3)...\n')

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

async function runMediaTests() {
    // ══════════════════════════════════════════
    // 1. VALIDAÇÃO DE URL & PREVENÇÃO DE SSRF
    // ══════════════════════════════════════════
    console.log('--- 1. Validação de URLs e Segurança SSRF ---')

    test('validateUrl aceita URLs públicas válidas e rejeita SSRF/Loopback', () => {
        assert.strictEqual(validateUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true)
        assert.strictEqual(validateUrl('https://instagram.com/reel/C_xxxxxx/'), true)
        assert.strictEqual(validateUrl('https://tiktok.com/@user/video/123'), true)

        // Rejeição de SSRF e endereços locais
        assert.strictEqual(validateUrl('http://localhost:3000'), false)
        assert.strictEqual(validateUrl('http://127.0.0.1:8080'), false)
        assert.strictEqual(validateUrl('http://169.254.169.254/latest/meta-data/'), false)
        assert.strictEqual(validateUrl('http://192.168.1.1/admin'), false)
        assert.strictEqual(validateUrl('http://10.0.0.1'), false)
        assert.strictEqual(validateUrl('file:///etc/passwd'), false)
        assert.strictEqual(validateUrl('ftp://example.com'), false)
        assert.strictEqual(validateUrl('invalido'), false)
    })

    // ══════════════════════════════════════════
    // 2. DETECTOR DE PLATAFORMAS & NORMALIZADORES
    // ══════════════════════════════════════════
    console.log('\n--- 2. Detecção e Normalização de Plataformas ---')

    test('detectPlatform identifica todas as 6 plataformas suportadas + genérico', () => {
        assert.strictEqual(detectPlatform('https://www.youtube.com/watch?v=123'), PLATFORMS.YOUTUBE)
        assert.strictEqual(detectPlatform('https://youtu.be/123'), PLATFORMS.YOUTUBE)
        assert.strictEqual(detectPlatform('https://instagram.com/reel/abc/'), PLATFORMS.INSTAGRAM)
        assert.strictEqual(detectPlatform('https://tiktok.com/@user/video/123'), PLATFORMS.TIKTOK)
        assert.strictEqual(detectPlatform('https://x.com/user/status/123'), PLATFORMS.TWITTER)
        assert.strictEqual(detectPlatform('https://twitter.com/user/status/123'), PLATFORMS.TWITTER)
        assert.strictEqual(detectPlatform('https://reddit.com/r/videos/comments/abc/'), PLATFORMS.REDDIT)
        assert.strictEqual(detectPlatform('https://pinterest.com/pin/123'), PLATFORMS.PINTEREST)
        assert.strictEqual(detectPlatform('https://exemplo.com/audio.mp3'), PLATFORMS.GENERIC)
        assert.strictEqual(detectPlatform('pesquisa sem url'), null)
    })

    test('normalizeUrl limpa parâmetros de rastreamento (utm, si, fbclid)', () => {
        const dirtyYt = 'https://youtu.be/kXYiU_JCYtU?si=AbCdEfGh&utm_source=share'
        const cleanYt = normalizeUrl(dirtyYt)
        assert.strictEqual(cleanYt, 'https://www.youtube.com/watch?v=kXYiU_JCYtU')

        const dirtyIg = 'https://www.instagram.com/reel/C_xxxxxx/?igsh=YWJkZXk='
        const cleanIg = normalizeUrl(dirtyIg)
        assert.strictEqual(cleanIg, 'https://www.instagram.com/reel/C_xxxxxx/')
    })

    // ══════════════════════════════════════════
    // 3. FORMAT RESOLVER (MP3, M4A, MP4)
    // ══════════════════════════════════════════
    console.log('\n--- 3. Resolução de Formatos e Qualidades ---')

    test('resolveDownloadFormat gera flags corretas para áudio e vídeo', () => {
        const mp3 = resolveDownloadFormat({ format: FORMATS.MP3 })
        assert.strictEqual(mp3.targetExt, 'mp3')
        assert(mp3.args.includes('--audio-format'))
        assert(mp3.args.includes('mp3'))

        const m4a = resolveDownloadFormat({ format: FORMATS.M4A })
        assert.strictEqual(m4a.targetExt, 'm4a')

        const mp4_1080 = resolveDownloadFormat({ format: FORMATS.MP4, quality: QUALITIES.P1080 })
        assert.strictEqual(mp4_1080.targetExt, 'mp4')
        assert(mp4_1080.args.some(a => a.includes('height<=1080')))

        const mp4_720 = resolveDownloadFormat({ format: FORMATS.MP4, quality: QUALITIES.P720 })
        assert(mp4_720.args.some(a => a.includes('height<=720')))
    })

    test('formatSearchResults formata catálogo de pesquisa com índice e duração', () => {
        const sampleResults = [
            { index: 1, title: 'Música 1', author: 'Artista A', durationFormatted: '03:30' },
            { index: 2, title: 'Música 2', author: 'Artista B', durationFormatted: '04:15' }
        ]
        const formatted = formatSearchResults('rock nacional', sampleResults)
        assert(formatted.includes('Resultados para'))
        assert(formatted.includes('Música 1'))
        assert(formatted.includes('Artista A'))
        assert(formatted.includes('03:30'))
        assert(formatted.includes('.play')) // prompt de seleção por número
    })

    // ══════════════════════════════════════════
    // 4. MEDIA JOB LIFECYCLE & CANCELAMENTO
    // ══════════════════════════════════════════
    console.log('\n--- 4. Ciclo de Vida do Media Job & Cancelamento ---')

    test('MediaEngine cria e cancela jobs com limpeza de diretório', () => {
        const job = mediaEngine.createJob({
            userId: '5511999999999@s.whatsapp.net',
            chatId: '120363000000000099@g.us',
            source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            requestedFormat: FORMATS.MP3
        })

        assert(job.id.startsWith('job_'))
        assert.strictEqual(job.status, 'PENDING')
        assert.strictEqual(job.platform, PLATFORMS.YOUTUBE)

        // Simula criação de pasta temporária do job
        const jobDir = path.join(tempDir, 'media', job.id)
        fs.mkdirSync(jobDir, { recursive: true })
        fs.writeFileSync(path.join(jobDir, 'temp.tmp'), 'dados')
        job.tempDir = jobDir

        mediaEngine.cancel(job.id)
        assert.strictEqual(job.status, 'CANCELLED')
        assert.strictEqual(fs.existsSync(jobDir), false, 'Diretório temporário do job deve ser excluído no cancelamento')
    })

    // ══════════════════════════════════════════
    // 5. STICKER EXIF & CLEANUP
    // ══════════════════════════════════════════
    console.log('\n--- 5. Compatibilidade com Figurinhas (.fig) & Limpeza ---')

    await testAsync('addExif preserva buffer e adiciona metadados WEBP', async () => {
        const dummyWebp = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
        const res = await addExif(dummyWebp, 'GOAT Test Pack', 'Martynz Dev')
        assert(Buffer.isBuffer(res))
        assert(res.length >= dummyWebp.length)
    })

    test('limparArquivosTemporarios remove arquivos expirados', () => {
        const testFileOld = path.join(tempDir, 'test_old_media.tmp')
        const testFileNew = path.join(tempDir, 'test_new_media.tmp')

        fs.writeFileSync(testFileOld, 'old content')
        fs.writeFileSync(testFileNew, 'new content')

        const past = new Date(Date.now() - 3600000)
        fs.utimesSync(testFileOld, past, past)

        limparArquivosTemporarios(1800000)

        assert.strictEqual(fs.existsSync(testFileOld), false)
        assert.strictEqual(fs.existsSync(testFileNew), true)

        try { if (fs.existsSync(testFileNew)) fs.unlinkSync(testFileNew) } catch (_) {}
    })

    // ══════════════════════════════════════════
    // 6. FILA DE PRIORIDADES E CONCORRÊNCIA (FASE 06)
    // ══════════════════════════════════════════
    console.log('\n--- 6. Fila de Prioridades e Concorrência ---')

    await testAsync('MediaQueue processa jobs com respeito à prioridade e concorrência máxima', async () => {
        const { MediaQueue, QUEUE_PRIORITIES } = require('../src/services/mediaQueue')
        const customQueue = new MediaQueue({ maxConcurrency: 1 })

        let executedOrder = []

        // Job 1: Inicia imediatamente (Worker 1)
        const job1Promise = customQueue.enqueue({
            url: 'https://youtube.com/watch?v=1',
            user: 'user1',
            priority: QUEUE_PRIORITIES.LOW,
            runFn: async () => {
                await new Promise(r => setTimeout(r, 40))
                executedOrder.push('job1_low')
                return true
            }
        })

        // Job 2: Fila com Prioridade Baixa
        const job2Promise = customQueue.enqueue({
            url: 'https://youtube.com/watch?v=2',
            user: 'user2',
            priority: QUEUE_PRIORITIES.LOW,
            runFn: async () => {
                executedOrder.push('job2_low')
                return true
            }
        })

        // Job 3: Fila com Prioridade Alta (Deve furar fila do job 2!)
        const job3Promise = customQueue.enqueue({
            url: 'https://youtube.com/watch?v=3',
            user: 'user_owner',
            priority: QUEUE_PRIORITIES.HIGH,
            runFn: async () => {
                executedOrder.push('job3_high')
                return true
            }
        })

        await Promise.all([job1Promise, job2Promise, job3Promise])

        // A ordem deve ser job1 (já estava rodando), job3 (alta prioridade), job2 (baixa prioridade)
        assert.deepStrictEqual(executedOrder, ['job1_low', 'job3_high', 'job2_low'])
    })

    test('MediaQueue cancela job pendente na fila', () => {
        const { MediaQueue } = require('../src/services/mediaQueue')
        const q = new MediaQueue({ maxConcurrency: 1 })

        // Preenche com 1 rodando
        q.enqueue({
            url: 'test1',
            user: 'u1',
            runFn: () => new Promise(r => setTimeout(r, 100))
        })

        // Adiciona job que será cancelado
        let rejected = false
        q.enqueue({
            id: 'job_to_cancel',
            url: 'test2',
            user: 'u2',
            runFn: () => Promise.resolve()
        }).catch(err => {
            if (err.code === 'CANCELLED') rejected = true
        })

        const cancelSuccess = q.cancel('job_to_cancel')
        assert.strictEqual(cancelSuccess, true)
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE MEDIA ENGINE:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runMediaTests().catch(err => {
    console.error('Erro na execução dos testes de mídia:', err)
    process.exit(1)
})
