/**
 * Media Uploader Service
 * Camada desacoplada para envio de mídias (áudio, vídeo, imagem, galerias) via Baileys
 */

const fs = require('fs')
const { MEDIA_ERRORS, FORMATS } = require('./constants')
const logger = require('../../core/logger')

/**
 * Envia o resultado do download para o chat do WhatsApp
 * @param {object} params
 * @param {object} params.client - Socket Baileys
 * @param {string} params.from - JID do destinatário/grupo
 * @param {object} params.job - Job do Media Engine
 * @param {object} params.downloadResult - Resultado do mediaDownloader
 * @param {object} [params.info] - Mensagem original cotada
 * @returns {Promise<object>}
 */
async function uploadMedia({ client, from, job, downloadResult, info = null }) {
    if (!client || !from) {
        const err = new Error('Cliente ou destinatário do WhatsApp não informado.')
        err.code = MEDIA_ERRORS.UPLOAD_FAILED
        throw err
    }

    const { filePath, files, isGallery, format } = downloadResult
    const metadata = job.metadata || {}
    const title = metadata.title || 'Mídia'
    const author = metadata.author || ''
    const duration = metadata.durationFormatted || ''

    try {
        if (isGallery && files && files.length > 1) {
            // Envio de Galeria com múltiplos itens
            for (let i = 0; i < files.length; i++) {
                const itemFile = files[i]
                const itemBuf = fs.readFileSync(itemFile)
                const isVideo = itemFile.endsWith('.mp4') || itemFile.endsWith('.webm')

                const caption = i === 0
                    ? `📸 *${title}*\n${[author, `${files.length} itens`].filter(Boolean).join(' · ')}`
                    : ''

                if (isVideo) {
                    await client.sendMessage(from, {
                        video: itemBuf,
                        caption,
                        mimetype: 'video/mp4'
                    }, { quoted: i === 0 ? info : undefined })
                } else {
                    await client.sendMessage(from, {
                        image: itemBuf,
                        caption
                    }, { quoted: i === 0 ? info : undefined })
                }

                // Pequeno delay para evitar rate limit de uploads
                if (i < files.length - 1) {
                    await new Promise(r => setTimeout(r, 400))
                }
            }

            return { success: true, type: 'gallery', count: files.length }
        }

        // A ficha é a mesma dos outros comandos: dados REAIS do arquivo, medidos
        // com ffprobe. Antes daqui saía só "🎬 *título*\nautor · duração" — o
        // .reddit era o único download sem ficha nenhuma.
        const { formatMediaCaption, getPlatformDisplayName } = require('./formatResolver')
        const ehAudio = format === FORMATS.MP3 || format === FORMATS.M4A

        // Mesma passagem de compatibilidade dos outros downloads: só mexe no
        // arquivo se ele realmente não fosse tocar no celular.
        let arquivo = filePath
        if (!ehAudio) {
            const { ensureMobileVideoCompatibility } = require('./mediaProcessor')
            arquivo = await ensureMobileVideoCompatibility(filePath)
        }

        const caption = formatMediaCaption({
            filePath: arquivo,
            platform: metadata.platform || getPlatformDisplayName(metadata.url || metadata.webpageUrl || ''),
            title,
            author,
            durationFormatted: duration,
            url: metadata.webpageUrl || metadata.url || '',
            uploadDate: metadata.uploadDate || metadata.upload_date,
            year: metadata.year,
            elapsedMs: downloadResult.elapsedMs,
            isAudio: ehAudio
        })

        if (ehAudio) {
            const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 35)
            const { enviarAudio } = require('./audioSender')
            await enviarAudio({
                client, from, info, caption,
                filePath: arquivo,
                fileName: `${cleanTitle}.${format}`,
                thumbnail: metadata.thumbnail, title, author,
                url: metadata.webpageUrl || metadata.url || ''
            })
            return { success: true, type: 'audio', format }
        }

        // Formato de Vídeo: passa pelo enviarVideo, que decide entre galeria,
        // arquivo e Drive conforme o tamanho — igual a todos os outros comandos.
        const { enviarVideo } = require('./videoSender')
        const nomeVideo = (title || 'video').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)
        await enviarVideo({ client, from, filePath: arquivo, caption, info, fileName: `${nomeVideo}.mp4` })

        return { success: true, type: 'video', format: 'mp4' }
    } catch (err) {
        logger.error('[MEDIA UPLOAD ERROR]', err)
        const uploadErr = new Error(`Falha no upload da mídia para o WhatsApp: ${err.message}`)
        uploadErr.code = MEDIA_ERRORS.UPLOAD_FAILED
        throw uploadErr
    }
}

module.exports = {
    uploadMedia
}

