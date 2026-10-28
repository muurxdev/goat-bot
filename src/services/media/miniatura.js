/**
 * Miniatura nítida e dimensões para imagens e vídeos enviados.
 *
 * Sem isto o Baileys gera a prévia com 32 px de largura em JPEG q50: enquanto a
 * mídia não baixa (dados móveis, download automático desligado), menus, capas e
 * vídeos aparecem como um borrão. Vídeo também ia sem largura/altura, e a prévia
 * ficava quadrada ou cortada (auditoria de mídia, 2026-09-17).
 *
 * Qualquer falha aqui só devolve o conteúdo como veio: a prévia é um detalhe e
 * nunca pode impedir o envio.
 */

const fs = require('fs')
const { spawn } = require('child_process')
const sharp = require('sharp')
const logger = require('../../core/logger')

const LARGURA = 320

/** @returns {Buffer|string|null} buffer ou caminho local da mídia */
function origemLocal(midia) {
    if (Buffer.isBuffer(midia)) return midia
    const url = midia && typeof midia === 'object' ? midia.url : null
    if (typeof url === 'string' && !/^https?:/i.test(url) && fs.existsSync(url)) return url
    return null
}

async function miniaturaDeImagem(origem) {
    const img = sharp(origem, { failOn: 'none' }).rotate()
    const meta = await img.metadata()
    const thumb = await img.clone()
        .resize(LARGURA, LARGURA, { fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
        .toBuffer()
    const girada = (meta.orientation || 1) >= 5
    return { thumb, width: girada ? meta.height : meta.width, height: girada ? meta.width : meta.height }
}

function rodar(cmd, args, entrada, timeoutMs) {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args)
        const partes = []
        const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error('tempo esgotado')) }, timeoutMs)
        proc.stdout.on('data', d => partes.push(d))
        proc.stderr.on('data', () => {})
        proc.on('error', err => { clearTimeout(timer); reject(err) })
        proc.on('close', code => {
            clearTimeout(timer)
            if (code !== 0) return reject(new Error(`${cmd} saiu com ${code}`))
            resolve(Buffer.concat(partes))
        })
        if (entrada) {
            proc.stdin.on('error', err => logger.debug(`[MINIATURA] stdin de ${cmd}: ${err.message}`))
            proc.stdin.end(entrada)
        }
    })
}

async function miniaturaDeVideo(origem) {
    // Vídeo em buffer só é analisado se for pequeno; acima disso o custo não compensa.
    if (Buffer.isBuffer(origem) && origem.length > 60 * 1024 * 1024) return null
    const entrada = Buffer.isBuffer(origem) ? 'pipe:0' : origem
    const stdin = Buffer.isBuffer(origem) ? origem : null
    const probe = await rodar('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height:stream_side_data=rotation', '-of', 'json', entrada], stdin, 15000)
    const s = (JSON.parse(probe.toString() || '{}').streams || [])[0] || {}
    const rot = Math.abs(Number((s.side_data_list || []).find(d => d.rotation !== undefined)?.rotation || 0))
    const deitado = rot === 90 || rot === 270
    const frame = await rodar('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', '1', '-i', entrada,
        '-frames:v', '1', '-vf', `scale=${LARGURA}:-2`, '-f', 'image2', '-c:v', 'mjpeg', '-q:v', '2', 'pipe:1'], stdin, 15000)
    if (!frame.length) return null
    return { thumb: frame, width: deitado ? s.height : s.width, height: deitado ? s.width : s.height }
}

/**
 * Completa jpegThumbnail/width/height de uma mensagem de imagem ou vídeo.
 * Não mexe no que o chamador já informou.
 * @param {object} conteudo conteúdo do sendMessage
 * @returns {Promise<object>}
 */
async function completarPrevia(conteudo) {
    if (!conteudo || typeof conteudo !== 'object' || conteudo.jpegThumbnail) return conteudo
    const tipo = conteudo.image ? 'image' : (conteudo.video ? 'video' : null)
    if (!tipo || conteudo.gifPlayback) return conteudo
    const origem = origemLocal(conteudo[tipo])
    if (!origem) return conteudo
    try {
        const r = tipo === 'image' ? await miniaturaDeImagem(origem) : await miniaturaDeVideo(origem)
        if (!r || !r.thumb) return conteudo
        const novo = { ...conteudo, jpegThumbnail: r.thumb }
        if (!novo.width && r.width && r.height) {
            novo.width = r.width
            novo.height = r.height
        }
        return novo
    } catch (err) {
        logger.debug(`[MINIATURA] Sem prévia própria para ${tipo}: ${err.message}`)
        return conteudo
    }
}

module.exports = { completarPrevia }
