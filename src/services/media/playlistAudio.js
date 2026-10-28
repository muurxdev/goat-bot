/**
 * Playlist de áudio no chat — usada pelo .playlist e pelo .media (link colado).
 *
 * Cada faixa sai com a ficha e o áudio (a capa vai anexada ao próprio áudio —
 * nada de foto separada). Uma única mensagem de andamento é editada
 * ("Faixa 3 de 12"), em vez de uma mensagem por passo, e no fim vem o resumo
 * com o que falhou. Antes o .media mandava até 500 faixas sem resumo, e falha
 * de faixa só aparecia no log.
 */

const fs = require('fs')
const logger = require('../../core/logger')
const M = require('../../utils/moldura')

/**
 * @param {object} o
 * @param {object} o.client
 * @param {string} o.from
 * @param {object} [o.info]
 * @param {Function} o.reply
 * @param {string} o.sender
 * @param {{title:string, platform:string, tracks:Array<{title:string, searchTerm:string}>, total?:number}} o.playlist
 * @param {boolean} [o.preferirPartes]
 * @returns {Promise<{enviadas:number, falhas:Array<{titulo:string, erro:string}>, total:number}>}
 */
async function enviarPlaylistDeAudio({ client, from, info, reply, sender, playlist, preferirPartes = false }) {
    const { mediaQueue } = require('../mediaQueue')
    const { searchAndDownloadAudio, LIMITE_FAIXAS_PLAYLIST } = require('../audioStreamService')
    const { formatMediaCaption } = require('./formatResolver')
    const { enviarAudio } = require('./audioSender')

    const faixas = playlist.tracks.slice(0, LIMITE_FAIXAS_PLAYLIST)
    const total = faixas.length
    const inicio = Date.now()
    const cortada = (playlist.total || playlist.tracks.length) > total

    const cabecalho = [
        M.cabecalho('📂', 'Playlist'),
        M.secao('🎧', playlist.title || 'Playlist', [
            `📱 *Plataforma:* ${playlist.platform || '—'}`,
            `🎵 *Faixas:* ${total}${cortada ? ` (a playlist tem mais; mando as primeiras ${total})` : ''}`
        ])
    ].join('\n\n')

    // Mensagem de andamento: editada a cada faixa, para não encher o grupo.
    let status = null
    const andamento = async (texto) => {
        const corpo = `${cabecalho}\n\n${texto}`
        try {
            if (status?.key) await client.sendMessage(from, { edit: status.key, text: corpo })
            else status = await client.sendMessage(from, { text: corpo }, info ? { quoted: info } : {})
        } catch (err) {
            logger.warn(`[PLAYLIST AUDIO] não atualizei o andamento: ${err.message}`)
        }
    }

    await andamento(`⏳ _Mando uma faixa de cada vez, com a capa._`)

    let enviadas = 0
    const falhas = []
    for (let i = 0; i < total; i++) {
        const faixa = faixas[i]
        await andamento(`⏳ *Faixa ${i + 1} de ${total}:* ${String(faixa.title || '').slice(0, 60)}`)
        try {
            const midia = await mediaQueue.enqueue({
                url: faixa.searchTerm,
                format: 'mp3',
                user: sender,
                runFn: () => searchAndDownloadAudio(faixa.searchTerm)
            })
            const caption = formatMediaCaption({
                filePath: midia.filePath, elapsedMs: midia.elapsedMs, platform: playlist.platform,
                title: `[${i + 1}/${total}] ${midia.title}`, author: midia.author,
                durationFormatted: midia.durationFormatted, url: midia.url,
                uploadDate: midia.uploadDate, year: midia.year, isAudio: true
            })
            try {
                await enviarAudio({
                    client, from, info, caption,
                    filePath: midia.filePath,
                    fileName: `${String(midia.title || 'faixa').slice(0, 30)}.mp3`,
                    thumbnail: midia.thumbnail, title: midia.title, author: midia.author, url: midia.url,
                    preferirPartes
                })
                enviadas++
            } finally {
                try { if (midia.filePath && fs.existsSync(midia.filePath)) fs.unlinkSync(midia.filePath) } catch (err) {
                    logger.warn(`[PLAYLIST AUDIO] não apaguei ${midia.filePath}: ${err.message}`)
                }
            }
        } catch (err) {
            logger.warn(`[PLAYLIST AUDIO] faixa ${i + 1} (${faixa.title}) falhou: ${err.message}`)
            falhas.push({ titulo: faixa.title || `faixa ${i + 1}`, erro: err.message })
        }
    }

    const minutos = Math.max(1, Math.round((Date.now() - inicio) / 60000))
    const linhasFim = [
        `✅ *Enviadas:* ${enviadas} de ${total}`,
        `⏱️ *Tempo:* ${minutos} min`
    ]
    if (falhas.length) {
        linhasFim.push(`❌ *Não consegui:* ${falhas.length}`)
        for (const f of falhas.slice(0, 5)) linhasFim.push(`• ${String(f.titulo).slice(0, 50)}`)
        if (falhas.length > 5) linhasFim.push(`• _e mais ${falhas.length - 5}, anotadas no registro do bot_`)
    }
    await andamento(M.secao(enviadas ? '🏁' : '⚠️', 'Terminei', linhasFim))
    logger.info(`[PLAYLIST AUDIO] "${playlist.title}": ${enviadas}/${total} enviadas para ${sender}`)
    return { enviadas, falhas, total }
}

module.exports = { enviarPlaylistDeAudio }
