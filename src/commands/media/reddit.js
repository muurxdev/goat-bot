/**
 * Comando .reddit
 * Download de vídeos e mídias do Reddit com áudio sincronizado via Media Engine
 */

const { mediaEngine, FORMATS } = require('../../services/media/mediaEngine')
const { mediaQueue } = require('../../services/mediaQueue')
const { uploadMedia } = require('../../services/media/mediaUploader')
const logger = require('../../core/logger')
const { falaDeErro } = require('../../services/media/mediaErrors')
const F = require('../../utils/formato')

module.exports = {
    name: 'reddit',
    aliases: ['rd', 'redditdl'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Baixa vídeos e postagens do Reddit através do link',
    usage: '<link do Reddit>',
    examples: ['https://www.reddit.com/r/videos/comments/xxxx/ — baixa o vídeo do post', 'https://redd.it/xxxx — link curto também funciona'],
    cooldownMs: 5000,
    execute: async ({ text, from, info, client, reply, sender, prefix = '.' }) => {
        const linkReddit = (String(text || '').match(/https?:\/\/\S+/) || [''])[0]
        if (!linkReddit || !require('../../services/media/plataformas').ehPlataforma(linkReddit, 'reddit')) {
            return reply(F.tela({
                emoji: '📥',
                titulo: text ? 'Isso não é um link do Reddit' : 'Baixar do Reddit',
                intro: text
                    ? 'Preciso de um link de post do Reddit (reddit.com ou redd.it).'
                    : 'Mande o link de um post do Reddit e eu envio o vídeo aqui, com o áudio junto.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'reddit', '<link do post>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([
                        F.cmd(prefix, 'reddit', 'https://www.reddit.com/r/videos/comments/xxxx/'),
                        F.cmd(prefix, 'reddit', 'https://redd.it/xxxx')
                    ]) }
                ],
                dica: 'No app do Reddit, toque em Compartilhar e depois em Copiar link.',
                proximos: [{ nome: 'queue', oque: 'ver a fila de downloads' }],
                prefix
            }))
        }

        await require('../../services/media/avisoDownload').avisarDownload({ client, from, info, reply, url: linkReddit, tipo: 'vídeo', plataforma: 'Reddit' })

        try {
            const meta = await mediaEngine.resolve(linkReddit)

            const downloadResult = await mediaQueue.enqueue({
                url: meta.webpageUrl,
                format: FORMATS.MP4,
                user: sender,
                runFn: async () => {
                    const job = mediaEngine.createJob({
                        userId: sender,
                        chatId: from,
                        source: meta.webpageUrl,
                        requestedFormat: FORMATS.MP4
                    })
                    job.metadata = meta
                    return mediaEngine.processJob(job)
                }
            })

            const job = { metadata: meta }
            await uploadMedia({ client, from, job, downloadResult, info })
            mediaEngine.cleanup(downloadResult.jobId)

            logger.info(`[REDDIT] Vídeo enviado com sucesso para ${sender}`)
        } catch (err) {
            logger.error(`[REDDIT ERROR] ${text.trim()}`, err)
            await reply(falaDeErro(err, { alvo: text.trim() }))
        }
    }
}

