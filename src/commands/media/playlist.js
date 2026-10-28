/**
 * Comando .playlist — baixa uma playlist inteira.
 *
 * Padrão (desde 2026-09-18): as MÚSICAS aqui no chat, cada uma com capa e
 * ficha, até 25 faixas, com o andamento numa mensagem só. Funciona com
 * playlist do YouTube e playlist ou álbum do Spotify, sem precisar de Drive.
 * Antes o comando só existia em modo vídeo pelo Drive e, sem Drive ligado,
 * só respondia que não dava.
 *
 * .playlist <url>               -> músicas no chat
 * .playlist <url> -listar       -> só mostra as faixas, sem baixar
 * .playlist <url> video [1080]  -> vídeos numa pasta do Drive (Drive ligado)
 */

const drive = require('../../services/drive/googleDriveService')
const { listarPlaylist, baixarPlaylistParaDrive, MAX_ITENS } = require('../../services/drive/playlistService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const QUALIDADES = { 360: '360p', 480: '480p', 720: '720p', 1080: '1080p', max: 'max' }

function formatarDuracao(seg) {
    if (!seg) return '—'
    const h = Math.floor(seg / 3600)
    const m = Math.floor((seg % 3600) / 60)
    const s = Math.floor(seg % 60)
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`
}

module.exports = {
    name: 'playlist',
    aliases: ['plist', 'baixarplaylist'],
    category: 'media',
    subcategory: 'Downloads',
    description: 'Baixa uma playlist: as músicas no chat, com capa, ou os vídeos no Drive',
    usage: '<link> [-listar] [video] [1080|720|480|360]',
    examples: ['https://youtube.com/playlist?list=xxxx — manda as músicas aqui, com capa', 'https://open.spotify.com/playlist/xxxx — playlist ou álbum do Spotify', 'https://youtube.com/playlist?list=xxxx -listar — só mostra as faixas', 'https://youtube.com/playlist?list=xxxx video — vídeos numa pasta do Drive'],
    cooldownMs: 15000,
    execute: async ({ sender, text, reply, client, from, info, prefix = '.' }) => {
        if (!text || !text.trim()) {
            return reply(F.tela({
                emoji: '📂',
                titulo: 'Baixar playlist',
                intro: 'Mando as músicas da playlist aqui no chat, uma de cada vez, com a ficha e a capa de cada faixa (até 25).',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: F.lista([
                        F.cmd(prefix, 'playlist', '<link>') + ' — as músicas, com capa',
                        F.cmd(prefix, 'playlist', '<link> -listar') + ' — só mostro as faixas',
                        F.cmd(prefix, 'playlist', '<link> video') + ' — os vídeos numa pasta do Drive'
                    ]) },
                    { emoji: '🔗', titulo: 'Links aceitos', linhas: F.lista([
                        'Playlist do YouTube ou do YouTube Music (youtube.com/playlist?list=…)',
                        'Playlist ou álbum do Spotify'
                    ]) }
                ],
                dica: 'Link de uma música tocada dentro de uma playlist baixa só aquela música: use o .play para ela.',
                proximos: [{ nome: 'play', args: 'nome da música', oque: 'baixar uma música só' }],
                prefix
            }))
        }

        const partes = text.trim().split(/\s+/)
        const url = partes[0]
        const soListar = /(^|\s)-?listar(\s|$)/i.test(text)

        const argQualidade = partes.slice(1).find(p => QUALIDADES[p.replace(/p$/i, '')])
        const quality = argQualidade ? QUALIDADES[argQualidade.replace(/p$/i, '')] : 'max'
        const querVideo = Boolean(argQualidade) || /(^|\s)-?(video|videos|mp4)(\s|$)/i.test(text)

        if (!/^https?:\/\//i.test(url)) {
            return reply(F.tela({
                emoji: '📂',
                titulo: 'Comece pelo link',
                intro: 'O primeiro item precisa ser o link da playlist; -listar e video vêm depois.',
                secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'playlist', 'https://youtube.com/playlist?list=xxxx')] }],
                prefix
            }))
        }

        // ── Músicas no chat (padrão) ──
        if (!querVideo) {
            const { resolvePlaylistTracks } = require('../../services/audioStreamService')
            await reply('⏳ Abrindo a playlist…')
            const pl = await resolvePlaylistTracks(url)
            if (!pl || !pl.isPlaylist || !pl.tracks.length) {
                return reply(F.tela({
                    emoji: '📂',
                    titulo: 'Não achei uma playlist nesse link',
                    intro: 'Aceito link de playlist do YouTube (youtube.com/playlist?list=…) e playlist ou álbum do Spotify. Link de uma música, mesmo tocada dentro de uma lista, é uma música só.',
                    proximos: [{ nome: 'play', args: url, oque: 'baixar só essa música' }],
                    prefix
                }))
            }
            if (soListar) {
                return reply(F.tela({
                    emoji: '📃',
                    titulo: pl.title || 'Playlist',
                    intro: `${pl.platform} · ${pl.tracks.length} faixa(s) que eu mando.`,
                    secoes: [{ emoji: '🎵', titulo: 'Faixas', linhas: pl.tracks.map((t, i) => `${String(i + 1).padStart(2, '0')}. ${String(t.title).slice(0, 55)}${t.duration && t.duration !== '—' ? ` _(${t.duration})_` : ''}`) }],
                    proximos: [{ nome: 'playlist', args: url, oque: 'baixar as faixas' }],
                    prefix
                }))
            }
            const { enviarPlaylistDeAudio } = require('../../services/media/playlistAudio')
            await enviarPlaylistDeAudio({ client, from, info, reply, sender, playlist: pl })
            return
        }

        // ── Vídeos no Drive ──
        if (!drive.isConfigured()) {
            logger.warn('[PLAYLIST CMD] Drive não configurado — rode node scripts/google-drive-auth.js')
            return reply(F.tela({
                emoji: '☁️',
                titulo: 'Vídeos de playlist vão pelo Drive',
                intro: 'Uma playlist inteira de vídeos não cabe no WhatsApp, então ela vai numa pasta do Drive, e o Drive não está ligado por aqui. As músicas eu mando direto no chat.',
                proximos: [{ nome: 'playlist', args: url, oque: 'mandar as músicas aqui, com capa' }],
                prefix
            }))
        }

        try {
            await reply('⏳ Abrindo a playlist…')
            const pl = await listarPlaylist(url, sender)

            if (soListar) {
                const linhas = pl.itens.slice(0, 30).map((it, i) =>
                    `${String(i + 1).padStart(2, '0')}. ${it.title.slice(0, 55)} _(${formatarDuracao(it.duration)})_`
                ).join('\n')
                return reply(
                    `📃 *${pl.titulo}*\n` +
                    `${pl.itens.length} vídeo(s)${pl.truncada ? ` (de ${pl.total}; eu baixo até ${MAX_ITENS})` : ''}\n\n` +
                    linhas +
                    (pl.itens.length > 30 ? `\n\n…e mais ${pl.itens.length - 30}.` : '') +
                    '\n\nPara baixar, mande o mesmo comando sem `-listar`.'
                )
            }

            // Uma playlist longa em 4K pode levar horas. Avisar antes evita que o
            // usuário repita o comando achando que travou.
            const status = await client.sendMessage(from, {
                text: `☁️ *${pl.titulo}*\n` +
                      `${pl.itens.length} vídeo(s) · ${quality === 'max' ? 'maior qualidade disponível' : quality}\n` +
                      `Isso leva um tempo. Eu aviso aqui quando terminar.`
            }, { quoted: info })

            let ultimoTexto = ''
            const onEvento = (evt) => {
                if (evt.fase !== 'baixando' && evt.fase !== 'enviando') return
                const fase = evt.fase === 'baixando' ? 'Baixando' : 'Enviando para o Drive'
                const sufixo = evt.pct != null ? ` · ${evt.pct}%` : ''
                const txt = `☁️ *${pl.titulo}*\n` +
                            `${fase} ${evt.indice} de ${evt.total}${sufixo}\n` +
                            `${String(evt.titulo || '').slice(0, 50)}`
                // Só edita quando o texto muda: evita flood de edições idênticas.
                if (txt === ultimoTexto) return
                ultimoTexto = txt
                client.sendMessage(from, { edit: status.key, text: txt })
                    .catch(e => logger.warn(`[PLAYLIST CMD] Não editei o status: ${e.message}`))
            }

            const r = await baixarPlaylistParaDrive({ url, quality, userJid: sender, onEvento })

            let msg = `✅ Pronto! *${r.titulo}* está no Drive:\n${r.pastaUrl}\n\n`
            msg += `${r.enviados.length} vídeo(s) enviados`
            if (r.truncada) msg += ` (a playlist tem ${r.totalOriginal}; baixei os primeiros ${MAX_ITENS})`
            if (r.falhas.length) {
                logger.warn(`[PLAYLIST CMD] ${r.falhas.length} falha(s) em "${url}": ` +
                    r.falhas.map(f => `${f.titulo} — ${f.erro}`).join(' | '))
                msg += `\n\nNão consegui baixar ${r.falhas.length}:\n`
                msg += r.falhas.slice(0, 5).map(f => `• ${f.titulo.slice(0, 40)}`).join('\n')
            }

            await client.sendMessage(from, { edit: status.key, text: msg })
                .catch(e => {
                    logger.warn(`[PLAYLIST CMD] Não editei o status final: ${e.message}`)
                    return reply(msg)
                })
        } catch (e) {
            logger.error(`[PLAYLIST CMD] Falhou para "${url}": ${e.message}`)
            const { falaDeErro } = require('../../services/media/mediaErrors')
            return reply(falaDeErro(e, { alvo: 'essa playlist' }))
        }
    }
}
