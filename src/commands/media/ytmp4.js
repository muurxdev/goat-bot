/**
 * Comando .ytmp4
 * Download direto de vídeo em MP4 na melhor qualidade do YouTube com otimização mobile
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
const { enviarVideo } = require('../../services/media/videoSender')
const { falaDeErro } = require('../../services/media/mediaErrors')
const F = require('../../utils/formato')

module.exports = {
    name: 'ytmp4',
    aliases: [ 'ytv', 'youtubevideo'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Baixa vídeos do YouTube em MP4 na melhor qualidade disponível',
    usage: '<nome ou link>',
    examples: ['tutorial nodejs — busca pelo nome', 'https://youtu.be/xxxx — link direto'],
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, prefix = '.' }) => {
        const inicioDownload = Date.now()
        if (!text) {
            return reply(F.tela({
                emoji: '🎬',
                titulo: 'Baixar vídeo do YouTube',
                intro: 'Mande o nome ou o link do vídeo e eu envio em MP4 na melhor qualidade que couber.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'ytmp4', '<nome ou link>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                        F.cmd(prefix, 'ytmp4', 'tutorial nodejs') + ' — busca pelo nome',
                        F.cmd(prefix, 'ytmp4', 'https://youtu.be/xxxx') + ' — link direto'
                    ]) }
                ],
                dica: 'Se o vídeo não couber no limite do WhatsApp, eu comprimo antes de enviar.',
                proximos: [
                    { nome: 'ytmp3', args: 'nome da música', oque: 'baixar só o áudio' },
                    { nome: 'queue', oque: 'ver a fila de downloads' }
                ],
                prefix
            }))
        }

        const platformName = getPlatformDisplayName(text)
        const ehLink = looksLikeUrl(text)
        // Busca por nome avisa já; o aviso com título e duração sai quando os dados chegam.
        if (!ehLink) await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: 'vídeo' })

        let alvo = text
        try {
            const meta = await extractMetadata(text, { isSearch: !ehLink })
            if (meta.title) alvo = meta.title
            const targetUrl = meta.webpageUrl || meta.url || text
            await avisarDownload({ client, from, info, reply, meta, url: targetUrl, plataforma: platformName, textoSimples: formatDownloadProgressCard({ platform: platformName, isAudio: false }), userJid: sender })

            const downloaded = await mediaQueue.enqueue({
                url: targetUrl,
                format: 'mp4',
                user: sender,
                duration: meta.duration,
                runFn: () => downloadMedia({
                    source: targetUrl,
                    url: targetUrl,
                    requestedFormat: 'mp4',
                    format: 'mp4',
                    duration: meta.duration,
                    metadata: meta,
                    userJid: sender
                })
            })

            let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('Arquivo de vídeo não encontrado após o download.')
            }

            // Otimização para reprodução no WhatsApp Mobile
            filePath = await ensureMobileVideoCompatibility(filePath)

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
                isAudio: false
            })

            try {
                                // Entrega na galeria sempre que possível; comprime se não couber,
                // e só vira documento em último caso (ou com a flag -doc).
                await enviarVideo({
                    client, from, filePath, caption, info,
                    fileName: `${cleanTitle}.mp4`,
                    preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                })
                logger.info(`[YTMP4] Vídeo (${sizeMb}) enviado para ${sender}: ${meta.title}`)
            } finally {
                try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (err) { logger.warn(`[YTMP4] Não apaguei o temporário ${filePath}: ${err.message}`) }
            }
        } catch (err) {
            logger.error(`[YTMP4 ERROR] "${alvo}":`, err)
            await reply(falaDeErro(err, { alvo }))
        }
    }
}
