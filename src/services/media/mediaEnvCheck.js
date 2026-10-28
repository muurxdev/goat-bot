/**
 * Validação de Ambiente de Mídia
 * Verifica a disponibilidade e versão de yt-dlp, ffmpeg e ffprobe no processo do bot.
 *
 * O PATH do processo Node NÃO é necessariamente igual ao do terminal interativo:
 * esta checagem roda exatamente com a mesma resolução de PATH usada pelo spawn.
 */

const { spawn } = require('child_process')
const logger = require('../../core/logger')

let cache = null

/**
 * Executa `<bin> --version` e captura versão/erro sem travar o processo
 * @param {string} bin
 * @returns {Promise<{ok: boolean, version: string|null, exitCode: number|null, error?: string}>}
 */
function runVersion(bin, timeoutMs = 8000) {
    return new Promise(resolve => {
        let proc
        try {
            proc = spawn(bin, ['--version'])
        } catch (err) {
            return resolve({ ok: false, version: null, exitCode: null, error: err.message })
        }

        let out = ''
        let errData = ''
        let settled = false
        const done = (result) => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            resolve(result)
        }

        const timer = setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (errIgnorado) { logger.warn(`[MEDIAENVCHECK] Falha ignorada em src/services/media/mediaEnvCheck.js:39: ${errIgnorado.message}`) }
            done({ ok: false, version: null, exitCode: null, error: 'timeout' })
        }, timeoutMs)

        proc.stdout.on('data', chunk => { out += chunk.toString() })
        proc.stderr.on('data', chunk => { errData += chunk.toString() })

        proc.on('error', err => {
            done({ ok: false, version: null, exitCode: null, error: err.message })
        })

        proc.on('close', code => {
            const version = (out || errData).trim().split('\n')[0] || null
            // "Disponível" = o processo estourou e respondeu (com --version), mesmo que
            // alguns builds locais de ffmpeg saiam com código != 0 para --version.
            const ok = Boolean(version)
            done({ ok, version, exitCode: code })
        })
    })
}

/**
 * Verifica (com cache) a disponibilidade dos binários do pipeline de mídia
 * @param {object} [opts]
 * @param {boolean} [opts.force] - Força nova verificação ignorando o cache
 * @returns {Promise<{ ytDlp: object, ffmpeg: object, ffprobe: object, allAvailable: boolean, checkedAt: number }>}
 */
async function checkMediaEnv({ force = false } = {}) {
    if (cache && !force) return cache

    const [ytDlp, ffmpeg, ffprobe] = await Promise.all([
        runVersion('yt-dlp'),
        runVersion('ffmpeg'),
        runVersion('ffprobe')
    ])

    cache = {
        ytDlp,
        ffmpeg,
        ffprobe,
        allAvailable: ytDlp.ok && ffmpeg.ok && ffprobe.ok,
        checkedAt: Date.now()
    }

    logger.info(`[MEDIA ENV] yt-dlp=${ytDlp.ok ? ytDlp.version : ('FALTA: ' + (ytDlp.error || '?'))} | ` +
        `ffmpeg=${ffmpeg.ok ? (ffmpeg.version || 'ok') : ('FALTA: ' + (ffmpeg.error || '?'))} | ` +
        `ffprobe=${ffprobe.ok ? (ffprobe.version || 'ok') : ('FALTA: ' + (ffprobe.error || '?'))}`)

    return cache
}

/**
 * Verificação rápida síncrona de disponibilidade do yt-dlp (usa cache)
 * @returns {boolean}
 */
function isYtDlpAvailable() {
    return Boolean(cache?.ytDlp?.ok)
}

/**
 * Verificação rápida síncrona de disponibilidade do ffmpeg (usa cache)
 * @returns {boolean}
 */
function isFfmpegAvailable() {
    return Boolean(cache?.ffmpeg?.ok)
}

module.exports = {
    checkMediaEnv,
    isYtDlpAvailable,
    isFfmpegAvailable,
    runVersion
}