/**
 * Converte qualquer áudio em nota de voz de verdade: OGG/Opus, 48 kHz, mono.
 *
 * O WhatsApp espera Opus em mensagem de voz (ptt). O TTS e os áudios de evento
 * saíam como MP3 rotulado "audio/mp4": sem forma de onda e com risco de não
 * tocar no iPhone (auditoria de mídia, 2026-09-17). A conversão leva menos de
 * 100 ms para áudios curtos.
 */

const { spawn } = require('child_process')
const logger = require('../../core/logger')

const OPUS = 'audio/ogg; codecs=opus'
const cache = new Map()
const CACHE_MAX = 60

/**
 * @param {Buffer} buffer    áudio de entrada (mp3, m4a, wav, ogg...)
 * @param {object} [o]
 * @param {string} [o.chave] identifica o arquivo para reaproveitar a conversão
 * @returns {Promise<{buffer: Buffer, mimetype: string}>}
 */
async function paraNotaDeVoz(buffer, { chave } = {}) {
    if (chave && cache.has(chave)) return { buffer: cache.get(chave), mimetype: OPUS }
    if (ehOggOpus(buffer)) return { buffer, mimetype: OPUS }
    try {
        const ogg = await converter(buffer)
        if (chave) {
            cache.set(chave, ogg)
            if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value)
        }
        return { buffer: ogg, mimetype: OPUS }
    } catch (err) {
        logger.warn(`[NOTA DE VOZ] Não converti para Opus, mando o original: ${err.message}`)
        return { buffer, mimetype: 'audio/mpeg' }
    }
}

function ehOggOpus(buffer) {
    return Buffer.isBuffer(buffer) && buffer.length > 36 &&
        buffer.subarray(0, 4).toString('latin1') === 'OggS' &&
        buffer.subarray(28, 36).toString('latin1') === 'OpusHead'
}

function converter(buffer) {
    return new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0',
            '-vn', '-ac', '1', '-ar', '48000', '-c:a', 'libopus', '-b:a', '64k',
            '-application', 'voip', '-f', 'ogg', 'pipe:1'])
        const partes = []
        let erro = ''
        const timer = setTimeout(() => {
            proc.kill('SIGKILL')
            reject(new Error('tempo esgotado'))
        }, 30000)
        proc.stdout.on('data', d => partes.push(d))
        proc.stderr.on('data', d => { erro += d })
        proc.on('error', err => { clearTimeout(timer); reject(err) })
        proc.on('close', code => {
            clearTimeout(timer)
            const saida = Buffer.concat(partes)
            if (code !== 0 || !saida.length) return reject(new Error(erro.slice(0, 200) || `ffmpeg saiu com ${code}`))
            resolve(saida)
        })
        proc.stdin.on('error', err => logger.warn(`[NOTA DE VOZ] Entrada do ffmpeg fechou cedo: ${err.message}`))
        proc.stdin.end(buffer)
    })
}

module.exports = { paraNotaDeVoz, ehOggOpus, OPUS }
