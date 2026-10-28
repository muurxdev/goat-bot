/**
 * Capa e ficha do MP3 (arte do álbum + tags ID3).
 *
 * O yt-dlp já embute capa e tags com `--embed-thumbnail --add-metadata`, mas
 * quase todo áudio que o bot entrega hoje NÃO passa por ele: quando o YouTube
 * barra o acesso, o arquivo vem da engine resiliente (cobalt/yt1s/loader.to) ou
 * do SoundCloud, e nesses caminhos o MP3 chega cru — sem capa, sem artista, sem
 * ano. No celular ele aparece como um quadrado cinza "faixa desconhecida".
 *
 * Aqui a capa é colada DEPOIS, sempre com `-c:a copy`: o áudio não é recodificado,
 * então não se perde qualidade nem se gasta CPU (a VPS tem 1 vCPU).
 */

const { spawn, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
const logger = require('../../core/logger')

const TIMEOUT_MS = 60000
const CAPA_MAX_BYTES = 8 * 1024 * 1024

/**
 * O arquivo já tem capa embutida? (stream de vídeo marcado como attached_pic)
 * @param {string} filePath
 * @returns {boolean}
 */
function temCapaEmbutida(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) return false
        const r = spawnSync('ffprobe', [
            '-v', 'quiet', '-print_format', 'json', '-show_streams', filePath
        ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
        if (r.status !== 0 || !r.stdout) return false
        const streams = JSON.parse(r.stdout).streams || []
        return streams.some(s => s.codec_type === 'video' && s.disposition?.attached_pic === 1)
    } catch (err) {
        logger.warn(`[CAPA] Não consegui inspecionar ${filePath}: ${err.message}`)
        return false
    }
}

/** Baixa a capa para um arquivo temporário. Devolve null se não der. */
async function baixarCapa(urlCapa) {
    try {
        const res = await fetch(urlCapa, { signal: AbortSignal.timeout(15000) })
        if (!res.ok) return null
        const buf = Buffer.from(await res.arrayBuffer())
        if (!buf.length || buf.length > CAPA_MAX_BYTES) return null
        const ext = /\.png(\?|$)/i.test(urlCapa) ? 'png' : 'jpg'
        const destino = path.join(os.tmpdir(), `capa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`)
        fs.writeFileSync(destino, buf)
        return destino
    } catch (err) {
        logger.warn(`[CAPA] Download da capa falhou (${urlCapa}): ${err.message}`)
        return null
    }
}

function rodarFfmpeg(args) {
    return new Promise((resolve, reject) => {
        let proc
        try {
            proc = spawn('ffmpeg', args)
        } catch (err) {
            return reject(err)
        }
        let stderr = ''
        proc.stderr.on('data', c => { stderr += c.toString() })
        const timer = setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (_) { /* já morreu */ }
            reject(new Error('ffmpeg passou do tempo limite ao embutir a capa'))
        }, TIMEOUT_MS)
        proc.on('error', err => { clearTimeout(timer); reject(err) })
        proc.on('close', code => {
            clearTimeout(timer)
            code === 0 ? resolve() : reject(new Error(`ffmpeg saiu com código ${code}: ${stderr.slice(-200)}`))
        })
    })
}

/**
 * Embute capa e tags no MP3, no lugar (mesmo caminho de arquivo).
 *
 * Nunca lança: é um acabamento: se falhar, o áudio segue como estava e o
 * usuário recebe a música do mesmo jeito.
 *
 * @param {string} filePath  MP3 já baixado
 * @param {object} dados
 * @param {string} [dados.thumbnail] URL da capa
 * @param {string} [dados.title]
 * @param {string} [dados.author]  vira artista e nome do álbum
 * @param {string} [dados.year]
 * @returns {Promise<boolean>} true se o arquivo foi enriquecido
 */
async function embutirCapaETags(filePath, { thumbnail, title, author, year } = {}) {
    if (!filePath || !fs.existsSync(filePath) || !/\.mp3$/i.test(filePath)) return false
    if (!thumbnail || temCapaEmbutida(filePath)) return false

    const capa = await baixarCapa(thumbnail)
    if (!capa) return false

    const saida = filePath.replace(/\.mp3$/i, `.capa_${Date.now()}.mp3`)
    const limpo = v => String(v || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 120)
    const meta = []
    if (limpo(title)) meta.push('-metadata', `title=${limpo(title)}`)
    if (limpo(author)) meta.push('-metadata', `artist=${limpo(author)}`, '-metadata', `album_artist=${limpo(author)}`)
    if (limpo(title)) meta.push('-metadata', `album=${limpo(title)}`)
    if (/^\d{4}$/.test(String(year || ''))) meta.push('-metadata', `date=${year}`)

    try {
        await rodarFfmpeg([
            '-y', '-loglevel', 'error',
            '-i', filePath,
            '-i', capa,
            '-map', '0:a', '-map', '1:v',
            // Áudio intacto: só a capa e as tags entram.
            '-c:a', 'copy',
            '-c:v', 'mjpeg',
            '-id3v2_version', '3',
            '-metadata:s:v', 'title=Album cover',
            '-metadata:s:v', 'comment=Cover (front)',
            ...meta,
            saida
        ])
        if (!fs.existsSync(saida) || fs.statSync(saida).size === 0) throw new Error('saída vazia')
        fs.renameSync(saida, filePath)
        logger.info(`[CAPA] Capa e ficha embutidas em ${path.basename(filePath)}`)
        return true
    } catch (err) {
        logger.warn(`[CAPA] Não embuti a capa em ${path.basename(filePath)}: ${err.message}`)
        try { if (fs.existsSync(saida)) fs.unlinkSync(saida) } catch (rmErr) { logger.warn(`[CAPA] Sobrou o temporário ${saida}: ${rmErr.message}`) }
        return false
    } finally {
        try { if (fs.existsSync(capa)) fs.unlinkSync(capa) } catch (rmErr) { logger.warn(`[CAPA] Sobrou a capa baixada ${capa}: ${rmErr.message}`) }
    }
}

module.exports = { embutirCapaETags, temCapaEmbutida }
