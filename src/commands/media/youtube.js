/**
 * Comando .youtube / .yt / .ytb
 * Central inteligente de download do YouTube (Vídeo MP4 na melhor qualidade por padrão ou Áudio MP3 com --mp3)
 * Compatível 100% com WhatsApp Mobile (Android/iOS) e Web
 */

const { avisarDownload } = require('../../services/media/avisoDownload')
const fs = require('fs')
const path = require('path')
const { extractMetadata, downloadMedia, looksLikeUrl } = require('../../services/mediaEngine')
const { getPlatformDisplayName, formatMediaCaption, formatDownloadProgressCard, calcularTempoComando } = require('../../services/media/formatResolver')
const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor')
const { mediaQueue } = require('../../services/mediaQueue')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const { enviarAudio } = require('../../services/media/audioSender')
const { enviarVideo } = require('../../services/media/videoSender')
const { falaDeErro } = require('../../services/media/mediaErrors')

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'ytb', 'ytdl', 'ytvideo'],
    category: 'media',
    description: 'Baixa vídeos e músicas do YouTube (padrão MP4 na melhor qualidade). Use --mp3 para áudio.',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info }) => {
        const inicioDownload = Date.now()
        const botName = getBotName()
        if (!text) {
            return reply(
                '▶️ *Como baixar do YouTube*\n' +
                '• `.youtube <link>` — mando o vídeo\n' +
                '• `.youtube <link> --mp3` — mando só o áudio\n' +
                '• `.youtube Saga Épica AMV` — busco pelo nome e mando o vídeo'
            )
        }

        const isAudio = text.includes('--mp3') || text.includes('--audio')
        const format = isAudio ? 'mp3' : 'mp4'
        const cleanQuery = text.replace(/--(mp3|mp4|video|audio)/gi, '').trim()
        const platformName = getPlatformDisplayName(cleanQuery)
        const ehLink = looksLikeUrl(cleanQuery)

        // Vídeo: o aviso detalhado sai quando os dados chegam. Áudio avisa já
        // (a capa vai anexada ao próprio arquivo, no fim).
        if (!ehLink || isAudio) {
            if (ehLink) await avisarDownload({ client, from, info, reply, url: cleanQuery, isAudio: true, tipo: 'áudio', plataforma: platformName, textoSimples: formatDownloadProgressCard({ platform: platformName, isAudio }), userJid: sender })
            else await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: isAudio ? 'áudio' : 'vídeo' })
        }

        let alvo = cleanQuery
        try {
            const meta = await extractMetadata(cleanQuery, { isSearch: !ehLink })
            if (meta.title) alvo = meta.title
            const targetUrl = meta.webpageUrl || meta.url || cleanQuery
            if (!isAudio) await avisarDownload({ client, from, info, reply, meta, url: targetUrl, plataforma: platformName, textoSimples: formatDownloadProgressCard({ platform: platformName, isAudio: false }), userJid: sender })

            const downloaded = await mediaQueue.enqueue({
                url: targetUrl,
                format,
                user: sender,
                duration: meta.duration,
                runFn: () => downloadMedia({
                    source: targetUrl,
                    url: targetUrl,
                    requestedFormat: format,
                    format,
                    duration: meta.duration,
                    metadata: meta,
                    userJid: sender
                })
            })

            let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('Arquivo não foi gerado ou está corrompido.')
            }

            // Otimização de compatibilidade para WhatsApp Mobile (H.264 + AAC + yuv420p + faststart)
            if (!isAudio) {
                filePath = await ensureMobileVideoCompatibility(filePath)
            }

            const stats = fs.statSync(filePath)
            const sizeMb = require('../../utils/tamanho').formatarTamanho(stats.size)
            const cleanTitle = (meta.title || 'video_youtube').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)

            const caption = formatMediaCaption({
                filePath,
                elapsedMs: calcularTempoComando(info, inicioDownload),
                platform: platformName,
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: targetUrl,
                uploadDate: meta.uploadDate,
                year: meta.year,
                isAudio
            })

            try {
                if (isAudio) {
                    // Ficha em texto + áudio com a capa anexada: duas mensagens, e
                    // nenhuma delas é uma foto solta repetindo a capa.
                    await enviarAudio({
                        client, from, info, caption,
                        filePath: filePath,
                        fileName: `${cleanTitle}.mp3`,
                        thumbnail: meta.thumbnail, title: meta.title, author: meta.author, url: targetUrl,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    })
                } else {
                    // Se o arquivo for menor/igual a 100MB, envia como vídeo reproduzível nativo
                                        // Entrega na galeria sempre que possível; comprime se não couber,
                    // e só vira documento em último caso (ou com a flag -doc).
                    await enviarVideo({
                        client, from, filePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    })
                }
                logger.info(`[YOUTUBE] ${format.toUpperCase()} (${sizeMb}) enviado para ${sender}: ${meta.title}`)
            } finally {
                try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (errIgnorado) { logger.warn(`[YOUTUBE] Falha ignorada em src/commands/media/youtube.js:123: ${errIgnorado.message}`) }
            }
        } catch (err) {
            logger.error(`[YOUTUBE ERROR] ${format} "${alvo}":`, err)
            await reply(falaDeErro(err, { alvo }))
        }
    }
}
