/**
 * Comando .ytmp3
 * Download direto de áudio em formato MP3 do YouTube
 */

const fs = require('fs')
const { extractMetadata, downloadMedia, looksLikeUrl } = require('../../services/mediaEngine')
const { formatMediaCaption, formatDownloadProgressCard, getPlatformDisplayName, calcularTempoComando } = require('../../services/media/formatResolver')
const { mediaQueue } = require('../../services/mediaQueue')
const logger = require('../../core/logger')

const { enviarAudio } = require('../../services/media/audioSender')
const { falaDeErro } = require('../../services/media/mediaErrors')
const F = require('../../utils/formato')
module.exports = {
    name: 'ytmp3',
    aliases: [ 'song', 'ytaudio'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Baixa músicas e áudios do YouTube',
    usage: '<nome ou link>',
    examples: ['Linkin Park In The End — busca pelo nome', 'https://youtu.be/xxxx — link direto'],
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, prefix = '.' }) => {
        const inicioDownload = Date.now()
        if (!text) {
            return reply(F.tela({
                emoji: '🎵',
                titulo: 'Baixar áudio do YouTube',
                intro: 'Mande o nome da música ou o link do vídeo e eu envio o áudio em MP3.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'ytmp3', '<nome ou link>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                        F.cmd(prefix, 'ytmp3', 'Linkin Park In The End') + ' — busca pelo nome',
                        F.cmd(prefix, 'ytmp3', 'https://youtu.be/xxxx') + ' — link direto'
                    ]) }
                ],
                dica: 'Pelo nome, eu pego o primeiro resultado da busca. Para ter certeza da versão, mande o link.',
                proximos: [
                    { nome: 'ytmp4', args: 'nome do vídeo', oque: 'baixar o vídeo' },
                    { nome: 'queue', oque: 'ver a fila de downloads' }
                ],
                prefix
            }))
        }

        const ehLink = looksLikeUrl(text)
        if (ehLink) await require('../../services/media/avisoDownload').avisarDownload({ client, from, info, reply, url: text, isAudio: true, tipo: 'áudio', plataforma: getPlatformDisplayName(text), textoSimples: formatDownloadProgressCard({ isAudio: true }), userJid: sender })
        else await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: 'áudio' })

        let alvo = text
        try {
            const meta = await extractMetadata(text, { isSearch: !ehLink })
            if (meta.title) alvo = meta.title
            const targetUrl = meta.webpageUrl || meta.url || text

            const downloaded = await mediaQueue.enqueue({
                url: targetUrl,
                format: 'mp3',
                user: sender,
                duration: meta.duration,
                runFn: () => downloadMedia({
                    source: targetUrl,
                    url: targetUrl,
                    requestedFormat: 'mp3',
                    format: 'mp3',
                    duration: meta.duration,
                    metadata: meta,
                    userJid: sender
                })
            })

            const filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('Arquivo de áudio não foi gerado ou está corrompido.')
            }

            const caption = formatMediaCaption({
                filePath,
                elapsedMs: calcularTempoComando(info, inicioDownload),
                platform: getPlatformDisplayName(targetUrl),
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: targetUrl,
                uploadDate: meta.uploadDate,
                year: meta.year,
                isAudio: true
            })

            // A capa em alta vai anexada ao áudio, não como foto separada.
            if (meta.thumbnail) {
                try {
                    const { upgradeThumbnail } = require('../../services/media/thumbnailResolver')
                    meta.thumbnail = await upgradeThumbnail(meta.thumbnail)
                } catch (err) {
                    logger.warn(`[YTMP3] Capa em alta indisponível para "${meta.title}", sigo com a padrão: ${err.message}`)
                }
            }

            const cleanTitle = (meta.title || 'audio_youtube').replace(/[\\/:*?"<>|]/g, '_').slice(0, 40)

            try {
                await enviarAudio({
                        client, from, info, caption,
                        filePath: filePath,
                        fileName: `${cleanTitle}.mp3`,
                        thumbnail: meta.thumbnail, title: meta.title, author: meta.author, url: targetUrl,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    })
                logger.info(`[YTMP3] Áudio enviado com sucesso para ${sender}: ${meta.title}`)
            } finally {
                try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (err) { logger.warn(`[YTMP3] Não apaguei o temporário ${filePath}: ${err.message}`) }
            }
        } catch (err) {
            logger.error(`[YTMP3 ERROR] "${alvo}":`, err)
            await reply(falaDeErro(err, { alvo }))
        }
    }
}
