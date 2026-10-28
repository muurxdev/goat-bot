/**
 * BotXP — FASE ADMIN+MEDIA FIX
 * Testes de diagnóstico/correção: ambiente de mídia, erros reais, retry seletivo,
 * spawn seguro e integração real via PATH do processo.
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const {
    checkMediaEnv,
    runVersion,
    lastErrorLines,
    toMessage,
    isMissingBinary,
    MEDIA_ERRORS,
    MEDIA_LIMITS,
    parseEnvMs,
    extractMetadata
} = require('../src/services/media/mediaEngine')
const { MediaQueue } = require('../src/services/mediaQueue')

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

async function run() {
    console.log('🧪 Iniciando testes da FASE ADMIN+MEDIA FIX...\n')

    // ── 1. Ambiente: binários do pipeline ──
    console.log('--- 1. Ambiente de Mídia (yt-dlp/ffmpeg/ffprobe) ---')

    await testAsync('runVersion detecta binário inexistente sem travar (ENOENT)', async () => {
        const res = await runVersion('binario_que_nao_existe_xyz_123')
        assert.strictEqual(res.ok, false)
        assert.ok(/ENOENT/i.test(res.error || ''), `erro deve mencionar ENOENT: ${res.error}`)
    })

    await testAsync('checkMediaEnv retorna estrutura consistente para os 3 binários', async () => {
        const info = await checkMediaEnv({ force: true })
        assert.ok(info.ytDlp && typeof info.ytDlp.ok === 'boolean')
        assert.ok(info.ffmpeg && typeof info.ffmpeg.ok === 'boolean')
        assert.ok(info.ffprobe && typeof info.ffprobe.ok === 'boolean')
        assert.strictEqual(info.allAvailable, Boolean(info.ytDlp.ok && info.ffmpeg.ok && info.ffprobe.ok))
        assert.ok(info.checkedAt > 0)
        const again = await checkMediaEnv()
        assert.strictEqual(again.checkedAt, info.checkedAt, 'checkMediaEnv usa cache')
    })

    // ── 2. Erros: stderr real ──
    console.log('\n--- 2. Erros não escondidos (causa real do stderr) ---')

    test('mediaErrors extrai a causa real do stderr sem esconder detalhe', () => {
        const stderr = 'WARNING: algo\nERROR: [TikTok] 123: Unexpected response from webpage request\nPlease confirm latest version'
        const detail = lastErrorLines(stderr)
        assert.ok(detail.includes('ERROR: [TikTok]'), detail)
        const msg = toMessage('Falha ao baixar', stderr)
        assert.ok(msg.includes('Falha ao baixar'), 'mensagem base preservada')
        assert.ok(msg.includes('Unexpected response'), 'detalhe real do extrator presente')
        assert.strictEqual(lastErrorLines('sem erro aqui'), '', 'sem linha ERROR retorna vazio')
        assert.ok(isMissingBinary({ code: 'ENOENT' }), 'ENOENT identificado como binário ausente')
        assert.ok(isMissingBinary({ message: 'spawn yt-dlp ENOENT' }))
    })

    test('constants: limites por env (parseEnvMs) e código EXECUTABLE_NOT_FOUND', () => {
        assert.strictEqual(parseEnvMs('240000', 180000), 240000)
        assert.strictEqual(parseEnvMs('abc', 180000), 180000)
        assert.strictEqual(parseEnvMs('', 180000), 180000)
        assert.strictEqual(parseEnvMs(null, 180000), 180000)
        assert.strictEqual(MEDIA_ERRORS.EXECUTABLE_NOT_FOUND, 'EXECUTABLE_NOT_FOUND')
        assert.strictEqual(MEDIA_LIMITS.DOWNLOAD_TIMEOUT_MS, 180000, 'timeout padrão de download 3min')
        assert.ok(MEDIA_LIMITS.MAX_FILE_SIZE_BYTES >= 64 * 1024 * 1024, 'limite WhatsApp suportado')
    })

    // ── 3. Retry seletivo ──
    console.log('\n--- 3. Política de Retry da Fila de Mídia ---')

    await testAsync('MediaQueue NÃO repete erros definitivos (MEDIA_NOT_FOUND)', async () => {
        const q = new MediaQueue({ maxConcurrency: 1 })
        let calls = 0
        await assert.rejects(
            q.enqueue({
                id: 'nao_retry',
                url: 'x',
                user: 'u1',
                retries: 3,
                runFn: async () => {
                    calls++
                    const e = new Error('indisponível')
                    e.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
                    throw e
                }
            }),
            /indisponível/
        )
        assert.strictEqual(calls, 1, 'não deve tentar de novo erro definitivo')
    })

    await testAsync('MediaQueue repete erros transitórios (TIMEOUT) e conclui', async () => {
        const q = new MediaQueue({ maxConcurrency: 1 })
        let calls = 0
        const result = await q.enqueue({
            id: 'retry_ok',
            url: 'x',
            user: 'u2',
            retries: 2,
            runFn: async () => {
                calls++
                if (calls === 1) {
                    const e = new Error('timeout transiente')
                    e.code = MEDIA_ERRORS.TIMEOUT
                    throw e
                }
                return 'ok'
            }
        })
        assert.strictEqual(result, 'ok')
        assert.strictEqual(calls, 2, 'deve tentar de novo após timeout transiente')
    })

    // ── 4. Integração real via spawn (PATH do PROCESSO) ──
    console.log('\n--- 4. Integração real via spawn (PATH do processo) ---')

    await testAsync('extractMetadata respeita a disponibilidade real do yt-dlp no PATH', async () => {
        const info = await checkMediaEnv({ force: true })
        try {
            const meta = await extractMetadata('https://youtu.be/dQw4w9WgXcQ')
            assert.ok(meta && meta.title, 'yt-dlp disponível: metadados extraídos (integração real)')
            assert.strictEqual(meta.platform, 'youtube')
        } catch (err) {
            if (!info.ytDlp.ok) {
                assert.strictEqual(err.code, MEDIA_ERRORS.EXECUTABLE_NOT_FOUND, 'sem yt-dlp no PATH deve ser EXECUTABLE_NOT_FOUND')
            } else {
                throw err
            }
        }
    })

    // ---- 5. Validação de cookies do yt-dlp (data/cookies.txt) ----
    const {
        validateCookiesFile
    } = require('../src/services/media/mediaArgs')
    const fs = require('fs')
    const os = require('os')
    const path = require('path')

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cookies-test-'))
    const validCookiesPath = path.join(tmpDir, 'cookies-valid.txt')
    fs.writeFileSync(validCookiesPath, `# Netscape HTTP Cookie File
# https://curl.se/docs/http-cookies.html
.youtube.com\tTRUE\t/\tTRUE\t2145916800\tHSID\tABC123def
.youtube.com\tTRUE\t/\tTRUE\t2145916800\tSID\tzzz999_YoutubeSID
.google.com\tTRUE\t/\tTRUE\t2145916800\tNID\t511=xyz\n`, 'utf8')

    const emptyCookiesPath = path.join(tmpDir, 'cookies-empty.txt')
    fs.writeFileSync(emptyCookiesPath, '', 'utf8')

    const garbageCookiesPath = path.join(tmpDir, 'cookies-garbage.txt')
    fs.writeFileSync(garbageCookiesPath, 'isto não é um cookies.txt', 'utf8')

    test('validateCookiesFile aceita arquivo Netscape válido com .youtube.com', () => {
        const res = validateCookiesFile(validCookiesPath)
        assert.strictEqual(res.ok, true, 'cookies válidos devem ter ok=true')
        assert.strictEqual(res.count, 3, 'deve contar os 3 cookies')
        assert.ok(/youtube\.com/.test(res.domain), 'domínio deve incluir youtube.com')
    })

    test('validateCookiesFile rejeita arquivo ausente', () => {
        const res = validateCookiesFile(path.join(tmpDir, 'nao-existe.txt'))
        assert.strictEqual(res.ok, false, 'ausente deve ser ok=false')
        assert.strictEqual(res.reason, 'AUSENTE', 'razão deve ser AUSENTE')
    })

    test('validateCookiesFile rejeita arquivo vazio', () => {
        const res = validateCookiesFile(emptyCookiesPath)
        assert.strictEqual(res.ok, false, 'vazio deve ser ok=false')
        assert.strictEqual(res.reason, 'VAZIO', 'razão deve ser VAZIO')
    })

    test('validateCookiesFile rejeita conteúdo sem formato Netscape', () => {
        const res = validateCookiesFile(garbageCookiesPath)
        assert.strictEqual(res.ok, false, 'conteúdo inválido deve ser ok=false')
        assert.strictEqual(res.reason, 'FORMATO_INVALIDO', 'razão deve ser FORMATO_INVALIDO')
    })

    // ---- 6. Validação do getYtDlpEnv (PO_TOKEN_PROVIDER) ----
    const { getYtDlpEnv } = require('../src/services/media/mediaArgs')
    test('getYtDlpEnv injeta PO_TOKEN_PROVIDER quando configurado', () => {
        const prev = process.env.PO_TOKEN_PROVIDER
        process.env.PO_TOKEN_PROVIDER = 'http://bgutil-pot-provider:4416/token'
        try {
            const env = getYtDlpEnv()
            assert.strictEqual(env.PO_TOKEN_PROVIDER, 'http://bgutil-pot-provider:4416/token', 'env do yt-dlp deve conter PO_TOKEN_PROVIDER')
            assert.ok(env.PATH, 'env deve herdar PATH do processo')
        } finally {
            process.env.PO_TOKEN_PROVIDER = prev
        }
    })

    console.log('\n========================================')
    console.log('📊 RESULTADO FASE ADMIN+MEDIA FIX:')
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
}

run().catch(err => {
    console.error('Erro na execução dos testes da fase:', err)
    process.exit(1)
})