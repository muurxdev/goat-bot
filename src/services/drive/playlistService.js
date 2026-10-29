/**
 * Download de playlist inteira -> pasta no Google Drive.
 *
 * POR QUE NÃO MANDAR OS VÍDEOS NO WHATSAPP
 * ----------------------------------------
 * Uma playlist de 50 vídeos viraria 50 mensagens de mídia. Isso estoura o
 * rate limit do WhatsApp, entope o grupo e ainda perde qualidade na compressão.
 * O resultado útil é UM link: a pasta do Drive com tudo dentro, em qualidade
 * máxima, que o usuário abre e assiste ou baixa item a item.
 *
 * POR QUE UM DE CADA VEZ
 * ----------------------
 * A VPS tem 2 vCPU e ~22 GB livres. Baixar em paralelo satura CPU (o merge do
 * ffmpeg é pesado) e enche o disco. Sequencial, apagando cada arquivo logo após
 * o upload, o pico de uso é o tamanho de UM vídeo.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')
const drive = require('./googleDriveService')
const diskGuard = require('./diskGuard')
const { buildYtDlpArgs, getYtDlpEnv } = require('../media/mediaArgs')
const { resolveDownloadFormat } = require('../media/formatResolver')

// Teto de itens por playlist. Sem isso, um link de "Todos os vídeos do canal"
// põe a VPS para baixar 2.000 arquivos e nunca mais para.
const MAX_ITENS = Number(process.env.PLAYLIST_MAX_ITENS || 50)

const { emMb } = require('../../utils/tamanho')

const mb = b => emMb(b)

function _exec(args, timeoutMs) {
    return new Promise((resolve, reject) => {
        const proc = spawn('yt-dlp', args, { env: getYtDlpEnv() })
        let out = ''
        let err = ''
        const t = setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (e) { /* já morreu */ }
            reject(new Error('yt-dlp excedeu o tempo limite'))
        }, timeoutMs)

        proc.stdout.on('data', d => { out += d })
        proc.stderr.on('data', d => { err += d })
        proc.on('error', e => { clearTimeout(t); reject(e) })
        proc.on('close', code => {
            clearTimeout(t)
            if (code === 0) resolve(out)
            else reject(new Error(err.trim().split('\n').pop() || `yt-dlp saiu com código ${code}`))
        })
    })
}

/**
 * Lista os itens da playlist sem baixar nada.
 * `--flat-playlist` só lê o índice: é rápido mesmo em playlist de centenas.
 *
 * @returns {Promise<{titulo:string, itens:Array<{id,title,url,duration}>, total:number, truncada:boolean}>}
 */
async function listarPlaylist(url, userJid = null) {
    const args = buildYtDlpArgs([
        '--flat-playlist',
        '--dump-single-json',
        '--no-warnings',
        '--playlist-end', String(MAX_ITENS),
        url
    ], { userJid })

    const raw = await _exec(args, 120000)
    let data
    try {
        data = JSON.parse(raw)
    } catch (e) {
        throw new Error('Não consegui ler a playlist (resposta inválida do yt-dlp)')
    }

    const entradas = Array.isArray(data.entries) ? data.entries.filter(Boolean) : []
    if (!entradas.length) throw new Error('Playlist vazia ou indisponível')

    const itens = entradas.map(e => ({
        id: e.id,
        title: e.title || e.id,
        url: e.url || (e.id ? `https://www.youtube.com/watch?v=${e.id}` : null),
        duration: e.duration || null
    })).filter(i => i.url)

    return {
        titulo: data.title || 'Playlist',
        itens,
        total: data.playlist_count || itens.length,
        truncada: (data.playlist_count || itens.length) > itens.length
    }
}

/** Nome de arquivo seguro para o Drive e para o disco. */
function nomeSeguro(s, max = 120) {
    return String(s)
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max) || 'video'
}

/** Baixa UM item na qualidade pedida. Devolve o caminho do arquivo. */
async function baixarItem(url, destDir, quality, userJid) {
    const fmt = resolveDownloadFormat({ format: 'mp4', quality })
    const saida = path.join(destDir, '%(title).120B.%(ext)s')

    const args = buildYtDlpArgs([
        '--no-playlist',
        '--no-warnings',
        '--no-progress',
        '--retries', '3',
        '-o', saida,
        ...fmt.args,
        url
    ], { userJid })

    await _exec(args, Number(process.env.PLAYLIST_ITEM_TIMEOUT_MS || 1800000))

    const arquivos = fs.readdirSync(destDir).map(f => path.join(destDir, f))
    if (!arquivos.length) throw new Error('yt-dlp terminou sem gerar arquivo')
    // Maior arquivo = o vídeo (o resto são thumbnails/legendas residuais).
    return arquivos.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)[0]
}

/**
 * Baixa a playlist inteira e sobe para uma pasta no Drive.
 *
 * @param {object} o
 * @param {(evt:{fase:string, indice?:number, total?:number, titulo?:string, pct?:number})=>void} [o.onEvento]
 * @returns {Promise<{pastaId, pastaUrl, titulo, enviados:Array, falhas:Array}>}
 */
async function baixarPlaylistParaDrive({ url, quality = 'max', userJid = null, onEvento = () => {} }) {
    if (!drive.isConfigured()) {
        throw new Error('Google Drive não está configurado neste bot')
    }

    onEvento({ fase: 'listando' })
    const pl = await listarPlaylist(url, userJid)
    onEvento({ fase: 'listada', total: pl.itens.length, titulo: pl.titulo })

    // Uma subpasta por playlist, dentro da pasta raiz do bot.
    const raiz = process.env.GDRIVE_FOLDER_ID || await drive.garantirPasta(process.env.GDRIVE_FOLDER_NAME || '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Bot')
    const pastaId = await drive.garantirPasta(nomeSeguro(pl.titulo, 80), raiz)
    await drive.tornarPublico(pastaId)

    const trabalho = path.join(tempDir, 'playlist', `${Date.now()}`)
    fs.mkdirSync(trabalho, { recursive: true })

    const enviados = []
    const falhas = []

    try {
        for (const [i, item] of pl.itens.entries()) {
            const n = i + 1
            onEvento({ fase: 'baixando', indice: n, total: pl.itens.length, titulo: item.title })

            const itemDir = path.join(trabalho, String(n))
            fs.mkdirSync(itemDir, { recursive: true })

            try {
                // Cada item ganha seu próprio diretório; assim identificar o
                // arquivo baixado não depende de adivinhar o nome que o yt-dlp deu.
                const arquivo = await baixarItem(item.url, itemDir, quality, userJid)
                const tamanho = fs.statSync(arquivo).size

                onEvento({ fase: 'enviando', indice: n, total: pl.itens.length, titulo: item.title })
                const r = await drive.uploadFile({
                    filePath: arquivo,
                    fileName: `${String(n).padStart(2, '0')} - ${nomeSeguro(item.title)}.mp4`,
                    mimeType: 'video/mp4',
                    folderId: pastaId,
                    onProgress: pct => onEvento({ fase: 'enviando', indice: n, total: pl.itens.length, titulo: item.title, pct })
                })
                enviados.push({ ...r, titulo: item.title })
                logger.info(`[PLAYLIST] ${n}/${pl.itens.length} "${item.title}" -> Drive (${mb(tamanho)} MB)`)
            } catch (e) {
                falhas.push({ titulo: item.title, erro: e.message })
                logger.warn(`[PLAYLIST] ${n}/${pl.itens.length} "${item.title}" falhou: ${e.message}`)
            } finally {
                // Apagar já libera o disco para o próximo item — é o que mantém
                // o pico de uso no tamanho de um vídeo só.
                try { fs.rmSync(itemDir, { recursive: true, force: true }) } catch (e) {
                    logger.warn(`[PLAYLIST] Não limpei ${itemDir}: ${e.message}`)
                }
            }

            // Se o disco apertar no meio, para em vez de derrubar o bot.
            const espaco = await diskGuard.temEspacoPara(2 * 1024 ** 3, tempDir)
            if (!espaco.ok) {
                logger.warn(`[PLAYLIST] Interrompida por falta de disco: ${espaco.motivo}`)
                falhas.push({ titulo: '(itens restantes)', erro: 'disco cheio na VPS' })
                break
            }
        }
    } finally {
        try { fs.rmSync(trabalho, { recursive: true, force: true }) } catch (e) {
            logger.warn(`[PLAYLIST] Não limpei ${trabalho}: ${e.message}`)
        }
    }

    return {
        pastaId,
        pastaUrl: `https://drive.google.com/drive/folders/${pastaId}`,
        titulo: pl.titulo,
        truncada: pl.truncada,
        totalOriginal: pl.total,
        enviados,
        falhas
    }
}

module.exports = { listarPlaylist, baixarPlaylistParaDrive, nomeSeguro, MAX_ITENS }
