/**
 * Comando .play
 * Pesquisa e reproduz músicas (MP3) ou vídeos (MP4) com capa oficial, dados limpos e link de origem
 * Suporta: .play <query> → MP3 | .play mp4 <query> → MP4 (melhor qualidade)
 */

const { avisarDownload } = require('../../services/media/avisoDownload')
const fs = require('fs')
const path = require('path')
const { rootDir } = require('../../config/paths')
const { searchAndDownloadAudio } = require('../../services/audioStreamService')
const { extractMetadata, downloadMedia } = require('../../services/mediaEngine')
const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor')
const { mediaQueue } = require('../../services/mediaQueue')
const logger = require('../../core/logger')
const { enviarAudio } = require('../../services/media/audioSender')
const { enviarVideo } = require('../../services/media/videoSender')
const { formatMediaCaption, calcularTempoComando } = require('../../services/media/formatResolver')
const F = require('../../utils/formato')

// Títulos que não dizem nada (vêm do fallback quando a busca não trouxe dados)
const TITULOS_VAZIOS = /^(música|musica|mídia|midia|vídeo|video|áudio|audio|áudio do youtube|sem título)$/i
const valorReal = v => {
    const t = String(v || '').trim()
    return (!t || t === '—' || t === '00:00' || /^(desconhecido|artista|youtube|cache)$/i.test(t)) ? '' : t
}

/**
 * Legenda da mídia entregue: título, artista ou canal, duração, visualizações
 * (quando a busca trouxe), a FICHA REAL do arquivo e o que dá para pedir em
 * seguida. Fica sempre dentro do limite de 1024 caracteres do WhatsApp.
 *
 * O "Código" do post saiu em 2026-09-20 a pedido do dono: no lugar dele entram
 * os dados que a pessoa não tem como descobrir sozinha — codec, resolução, fps,
 * taxa de bits, amostragem e canais do que acabou de chegar.
 */
function legendaMidia({ prefix = '.', isAudio, title, author, durationFormatted, views, url, filePath, platform, pedido, uploadDate, year, id, elapsedMs, info, inicioPedido }) {
    const tempoReal = elapsedMs || (info ? calcularTempoComando(info, inicioPedido) : null)
    return formatMediaCaption({
        platform: platform || 'YouTube',
        rotuloOrigem: 'Origem',
        rotuloAutor: isAudio ? 'Artista' : (/youtube/i.test(platform || '') ? 'Canal' : 'Autor'),
        title: TITULOS_VAZIOS.test(String(title || '').trim()) ? '' : title,
        author: valorReal(author),
        durationFormatted: valorReal(durationFormatted),
        url,
        isAudio,
        filePath,
        elapsedMs: tempoReal,
        uploadDate,
        year,
        id
    })
}

/** O YouTube recusou o pedido achando que sou um robô. */
const ehBloqueioYoutube = err => /Sign in to confirm|not a bot|Anti-Bot|barrou meu acesso/i.test(String(err?.message || '') + String(err?.stderr || ''))

/** Mensagem de erro para quem pediu: o que houve, o que fazer e exemplos prontos. */
function telaErro(err, { alvo, acao = 'baixar', prefix = '.' }) {
    const { falaDeErro } = require('../../services/media/mediaErrors')
    const nome = /^https?:\/\//i.test(String(alvo || '')) ? '<nome da música>' : String(alvo || '<nome>').slice(0, 50)
    if (ehBloqueioYoutube(err)) {
        return F.tela({
            emoji: '🔒',
            titulo: 'O YouTube não liberou agora',
            intro: 'O YouTube às vezes recusa meus pedidos por achar que sou um robô. Não tem nada de errado com o que você pediu.',
            dica: 'Espere alguns minutos e tente de novo. Pedir pelo nome, em vez do link, costuma funcionar porque eu procuro em outros lugares também.',
            proximos: [
                { nome: 'play', args: nome, oque: 'tentar de novo pelo nome' },
                { nome: 'spotify', args: nome, oque: 'buscar pelo Spotify' }
            ],
            prefix
        })
    }
    return [
        falaDeErro(err, { alvo, acao }),
        F.proximos(prefix, [
            acao === 'buscar'
                ? { nome: 'play', args: nome, oque: 'baixar direto pelo nome' }
                : { nome: 'play', args: 'search ' + nome, oque: 'ver opções e escolher pelo número' },
            { nome: 'spotify', args: nome, oque: 'tentar pelo Spotify' }
        ])
    ].join('\n\n')
}

module.exports = {
    name: 'play',
    aliases: ['musica', 'tocar', 'som', 'playmp3', 'audio'],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Pesquisa e baixa músicas (MP3) ou vídeos (MP4) do YouTube e Spotify',
    usage: '[mp4 | hd | capa | search] <nome ou link>',
    examples: [
        'Deixa Acontecer — mando o áudio da música',
        'mp4 Numb Linkin Park — mando o vídeo',
        'hd Numb Linkin Park — o mesmo que mp4: já vem na maior qualidade',
        'capa Blinding Lights — mando a capa em alta',
        'search Evidências — mostro opções para você escolher pelo número'
    ],
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender, prefix = '.' }) => {
        // Conta desde o pedido — inclui busca, fila e conversão, que é o que a
        // pessoa realmente esperou, e não só o tempo de download.
        const inicioPedido = Date.now()
        if (!text) {
            return reply(F.tela({
                emoji: '🎵',
                titulo: 'Pedir uma música',
                intro: 'Me diga o nome ou mande o link, e eu entrego o áudio, o vídeo ou a capa aqui na conversa.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        `• ${F.cmd(prefix, 'play', '<nome ou link>')} — mando o áudio`,
                        `• ${F.cmd(prefix, 'play', 'mp4 <nome ou link>')} — mando o vídeo`,
                        `• ${F.cmd(prefix, 'play', 'hd <nome ou link>')} — mesmo que mp4 (todo vídeo já vem no máximo)`,
                        `• ${F.cmd(prefix, 'play', 'capa <nome ou link>')} — mando a capa`,
                        `• ${F.cmd(prefix, 'play', 'search <nome>')} — mostro opções para escolher pelo número`
                    ] },
                    { emoji: '📌', titulo: 'Exemplos', linhas: [
                        `• ${F.cmd(prefix, 'play', 'Deixa Acontecer Grupo Revelação')}`,
                        `• ${F.cmd(prefix, 'play', 'mp4 Numb Linkin Park')}`,
                        `• ${F.cmd(prefix, 'play', 'search Evidências')}`
                    ] }
                ],
                dica: 'Nome da música com o artista acerta mais. Aceito links do YouTube e do Spotify (faixas, álbuns e playlists).',
                proximos: [
                    { nome: 'spotify', args: '<link de playlist>', oque: 'baixar uma playlist inteira' },
                    { nome: 'fig', oque: 'transformar foto ou vídeo em figurinha' }
                ],
                prefix
            }))
        }

        // 1. Execução de áudio local
        if (text.startsWith('local ')) {
            const nome = text.replace('local ', '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
            const musica = path.join(rootDir, 'musicas', nome + '.mp3')

            if (!fs.existsSync(musica)) {
                return reply(F.tela({
                    emoji: '🔍',
                    titulo: 'Não achei na minha coleção',
                    intro: `Não tenho nenhuma música guardada com o nome *${nome || 'vazio'}*.`,
                    dica: 'Para músicas fora da coleção, peça pelo nome normal, sem a palavra local.',
                    proximos: [{ nome: 'play', args: nome || '<nome da música>', oque: 'buscar a música na internet' }],
                    prefix
                }))
            }

            return client.sendMessage(from, {
                audio: { url: musica },
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: info })
        }

        // Detecta o modo solicitado pelo usuário (vídeo, áudio ou capa oficial)
        // "hd" virou apelido de "mp4": desde 2026-09-20 TODO vídeo sai na maior
        // resolução e fps que a plataforma tiver (ver formatResolver). A palavra
        // continua valendo para quem já se acostumou a digitar.
        const wantsHd = /^hd\s+|^(mp4|video|vídeo)\s+hd\s+/i.test(text)
        const wantsMp4 = wantsHd || /^(mp4|video|vídeo)\s+/i.test(text)
        const wantsCover = /^(capa|cover|img|foto|imagem)\s+/i.test(text)
        let cleanQuery = text.replace(/^(mp4\s+hd|video\s+hd|vídeo\s+hd|hd|mp3|audio|mp4|video|vídeo|capa|cover|img|foto|imagem)\s+/i, '').replace(/[\x60$\";&|<>]/g, '').trim()
        // ".play mp4" ou ".play search" sozinhos: faltou o nome, não é uma música chamada "mp4"
        const soOModo = /^(hd|mp4|video|vídeo|capa|cover|img|foto|imagem|search|busca|lista|procurar)$/i.test(text.trim())
        if (!cleanQuery || soOModo) {
            return reply(F.tela({
                emoji: '✍️',
                titulo: 'Faltou o nome',
                intro: 'Você escolheu o formato, mas não disse o que buscar.',
                secoes: [{ emoji: '📌', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, 'play', 'mp4 Numb Linkin Park')}`,
                    `• ${F.cmd(prefix, 'play', 'capa Blinding Lights')}`,
                    `• ${F.cmd(prefix, 'play', 'Deixa Acontecer')}`
                ] }],
                prefix
            }))
        }

        const { searchMedia, formatSearchResults } = require('../../services/media/mediaSearch')
        const { setSelection, pickSelection } = require('../../services/media/selectionStore')
        const isUrl = /^https?:\/\//i.test(cleanQuery)
        const isNumber = /^\d{1,2}$/.test(cleanQuery)
        const isExplicitSearch = /^(search|busca|lista|procurar)\s+/i.test(cleanQuery)

        let downloadInput = cleanQuery
        let downloadAsVideo = wantsMp4
        // O que citar na frase de erro: o nome pedido ou o título escolhido.
        let alvoPedido = cleanQuery

        // Fluxo A: número → baixa o item escolhido da última busca
        if (isNumber) {
            const sel = pickSelection(from, sender, cleanQuery)
            if (!sel) {
                return reply(F.tela({
                    emoji: '🔍',
                    titulo: 'Nenhuma lista aberta',
                    intro: `Não tenho opções guardadas para você escolher o número *${cleanQuery}*. A lista de busca vale por 5 minutos.`,
                    proximos: [
                        { nome: 'play', args: 'search <nome>', oque: 'buscar e ver as opções' },
                        { nome: 'play', args: '<nome da música>', oque: 'baixar direto o primeiro resultado' }
                    ],
                    prefix
                }))
            }
            downloadInput = sel.chosen.url
            downloadAsVideo = wantsMp4 ? true : !sel.isAudio
            alvoPedido = sel.chosen.title
            await avisarDownload({ client, from, info, reply, url: sel.chosen.url, meta: { title: sel.chosen.title }, isAudio: !downloadAsVideo, tipo: downloadAsVideo ? 'vídeo' : 'áudio' })
        }
        // Fluxo B: busca explícita (.play search <nome> / .play lista <nome>)
        else if (isExplicitSearch) {
            const searchQuery = cleanQuery.replace(/^(search|busca|lista|procurar)\s+/i, '').trim()
            // Aqui nada é baixado: a pessoa vai ESCOLHER entre as opções, então o aviso é de pesquisa.
            await require('../../services/media/avisoDownload').avisarPesquisa({ client, from, info, reply, termo: searchQuery })
            try {
                const results = await searchMedia(searchQuery, { limit: 5 })
                if (!results || results.length === 0) {
                    return reply(F.tela({
                        emoji: '🔍',
                        titulo: 'Nenhum resultado',
                        intro: `Não achei nada para *${searchQuery.slice(0, 60)}*.`,
                        dica: 'Confira a grafia, junte o nome do artista ou mande o link da música.',
                        proximos: [
                            { nome: 'spotify', args: searchQuery.slice(0, 60), oque: 'tentar pelo Spotify' }
                        ],
                        prefix
                    }))
                }
                results.forEach((r, i) => { r.index = i + 1 })
                setSelection(from, sender, { query: searchQuery, results, isAudio: !wantsMp4 })

                return reply(formatSearchResults(searchQuery, results, { cmd: 'play', isAudio: !wantsMp4 }))
            } catch (e) {
                logger.error(`[PLAY SEARCH ERROR] busca "${searchQuery}":`, e)
                return reply(telaErro(e, { alvo: searchQuery, acao: 'buscar', prefix }))
            }
        }
        // Fluxo C: URL direta
        else if (isUrl) {
            downloadAsVideo = wantsMp4
            // Com "capa", o aviso certo vem logo abaixo
            if (!wantsCover && !downloadAsVideo) await avisarDownload({ client, from, info, reply, meta: { title: null }, isAudio: true, tipo: 'áudio', textoSimples: '⏳ Baixando o áudio do link…', url: null, plataforma: require('../../services/media/plataformas').identificarLink(cleanQuery).nome, userJid: sender })
        }
        // Fluxo D: download de capa oficial em HD (.play capa <nome/link> ou .play img)
        if (wantsCover) {
            await reply(`🖼️ Procurando a capa de *${/^https?:\/\//i.test(cleanQuery) ? 'esse link' : cleanQuery.slice(0, 50)}*…`)
            try {
                const { resolveSpotifyMetadata } = require('../../services/audioStreamService')
                const { upgradeThumbnail } = require('../../services/media/thumbnailResolver')
                let title = 'Mídia'
                let author = 'Desconhecido'
                let thumb = null
                let origUrl = cleanQuery

                if (/spotify\.com/i.test(cleanQuery)) {
                    const sp = await resolveSpotifyMetadata(cleanQuery)
                    title = sp.title || title
                    author = sp.author || author
                    thumb = sp.thumbnail
                    origUrl = sp.url || cleanQuery
                } else {
                    const meta = await extractMetadata(cleanQuery, { isSearch: !isUrl, userJid: sender })
                    title = meta.title || title
                    author = meta.author || author
                    thumb = meta.thumbnail
                    origUrl = meta.webpageUrl || meta.url || cleanQuery
                }

                if (thumb) {
                    thumb = await upgradeThumbnail(thumb)
                    const pedir = (isUrl ? cleanQuery : (title !== 'Mídia' ? title : cleanQuery)).slice(0, 80)
                    let caption = F.tela({
                        emoji: '🖼️',
                        titulo: title !== 'Mídia' ? title : 'Capa encontrada',
                        intro: [valorReal(author) ? F.campo('Artista', author) : null, origUrl ? String(origUrl) : null].filter(Boolean).join('\n'),
                        proximos: [
                            { nome: 'play', args: pedir, oque: 'o áudio' },
                            { nome: 'play', args: `mp4 ${pedir}`, oque: 'o vídeo' }
                        ],
                        prefix
                    })
                    if (caption.length > 1024) caption = caption.slice(0, 1020) + '…'

                    return await client.sendMessage(from, {
                        image: { url: thumb },
                        caption
                    }, { quoted: info })
                } else {
                    return reply(F.tela({
                        emoji: '🔍',
                        titulo: 'Capa não encontrada',
                        intro: `Achei a música, mas ela não tem capa disponível${isUrl ? '' : ` para *${cleanQuery.slice(0, 50)}*`}.`,
                        dica: 'Com o link da faixa no Spotify a capa oficial quase sempre aparece.',
                        proximos: [{ nome: 'play', args: 'capa <link do Spotify>', oque: 'tentar pelo link' }],
                        prefix
                    }))
                }
            } catch (coverErr) {
                logger.error(`[PLAY COVER ERROR] capa "${cleanQuery}":`, coverErr)
                return reply(telaErro(coverErr, { alvo: cleanQuery, acao: 'buscar a capa de', prefix }))
            }
        }

        // Fluxo E: texto direto (.play mp4 <nome> ou .play <nome>) → download direto sem esperar
        else if (!isNumber && !isUrl) {
            downloadAsVideo = wantsMp4
            await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: downloadAsVideo ? 'vídeo' : 'áudio' })
        }

        try {
            if (downloadAsVideo) {
                // === DOWNLOAD VÍDEO MP4 ===
                const targetUrl = downloadInput
                const isDirectUrl = /^https?:\/\//i.test(targetUrl)

                // Extrai metadados (rápido, sem download)
                let meta = { title: 'Vídeo', author: 'Desconhecido', durationFormatted: '—', thumbnail: null, platform: 'YouTube' }
                try {
                    meta = await extractMetadata(targetUrl, { isSearch: !isDirectUrl, userJid: sender })
                } catch (metaErr) {
                    logger.warn(`[PLAY] Sem dados prévios do vídeo "${targetUrl}", sigo com o download: ${metaErr.message}`)
                }

                const resolvedUrl = meta.webpageUrl || meta.url || targetUrl
                await avisarDownload({ client, from, info, reply, meta, url: resolvedUrl, plataforma: meta.platform || '', textoSimples: '⏳ Baixando o vídeo… mando assim que ficar pronto.', userJid: sender })

                const downloaded = await mediaQueue.enqueue({
                    url: resolvedUrl,
                    format: 'mp4',
                    user: sender,
                    duration: meta.duration,
                    runFn: () => downloadMedia({
                        source: resolvedUrl,
                        url: resolvedUrl,
                        requestedFormat: 'mp4',
                        format: 'mp4',
                        quality: wantsHd ? 'hd' : 'best',
                        duration: meta.duration,
                        metadata: meta,
                        userJid: sender
                    })
                })

                let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
                if (!filePath || !fs.existsSync(filePath)) {
                    throw new Error('Arquivo de vídeo não encontrado após o download.')
                }

                filePath = await ensureMobileVideoCompatibility(filePath)
                const stats = fs.statSync(filePath)
                const sizeMb = require('../../utils/tamanho').formatarTamanho(stats.size)
                const cleanTitle = (meta.title || 'video').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)

                const caption = legendaMidia({
                    prefix,
                    isAudio: false,
                    filePath,
                    platform: meta.platform || 'YouTube',
                    title: meta.title,
                    author: meta.author,
                    durationFormatted: meta.durationFormatted,
                    views: meta.views || meta.viewCount || meta.view_count,
                    url: resolvedUrl,
                    pedido: alvoPedido,
                    uploadDate: meta.uploadDate || meta.upload_date,
                    year: meta.year || meta.release_year,
                    id: meta.id,
                    elapsedMs: calcularTempoComando(info, inicioPedido)
                })

                try {
                                        // Entrega na galeria sempre que possível; comprime se não couber,
                    // e só vira documento em último caso (ou com a flag -doc).
                    await enviarVideo({
                        client, from, filePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    })
                    logger.info(`[PLAY] Vídeo (${sizeMb}) enviado para ${sender}: ${meta.title}`)
                } finally {
                    try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (rmErr) { logger.warn(`[PLAY] Não apaguei o vídeo temporário ${filePath}: ${rmErr.message}`) }
                }
            } else {
                // === DOWNLOAD ÁUDIO MP3 ===
                const mediaData = await mediaQueue.enqueue({
                    url: downloadInput,
                    format: 'mp3',
                    user: sender,
                    runFn: async () => {
                        return searchAndDownloadAudio(downloadInput)
                    }
                })

                const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 35)

                const audioCaption = legendaMidia({
                    prefix,
                    isAudio: true,
                    filePath: mediaData.filePath,
                    platform: mediaData.platform || 'YouTube',
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    views: mediaData.views,
                    url: mediaData.url,
                    pedido: alvoPedido,
                    uploadDate: mediaData.uploadDate,
                    year: mediaData.year,
                    id: mediaData.id,
                    elapsedMs: calcularTempoComando(info, inicioPedido)
                })

                // A capa em alta vai anexada ao próprio áudio. Mandar a foto e,
                // logo depois, o áudio era a mesma coisa duas vezes na conversa.
                if (mediaData.thumbnail) {
                    try {
                        const { upgradeThumbnail } = require('../../services/media/thumbnailResolver')
                        mediaData.thumbnail = await upgradeThumbnail(mediaData.thumbnail)
                    } catch (capaErr) {
                        logger.warn(`[PLAY] Capa em alta indisponível para "${mediaData.title}", sigo com a padrão: ${capaErr.message}`)
                    }
                }

                if (!mediaData.filePath || !fs.existsSync(mediaData.filePath)) {
                    // Antes o comando simplesmente não respondia nada aqui: a ficha
                    // ia numa foto solta e o áudio, que não existia, ficava por isso.
                    throw new Error('Arquivo de áudio não encontrado após o download.')
                }

                try {
                    await enviarAudio({
                        client, from, info,
                        caption: audioCaption,
                        filePath: mediaData.filePath,
                        fileName: `${cleanFileName}.mp3`,
                        thumbnail: mediaData.thumbnail, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    })
                    logger.info(`[PLAY] Áudio enviado para ${sender}: ${mediaData.title}`)
                } finally {
                    try { if (fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath) } catch (rmErr) { logger.warn(`[PLAY] Não apaguei o áudio temporário ${mediaData.filePath}: ${rmErr.message}`) }
                }
            }
        } catch (err) {
            logger.error(`[PLAY ERROR] ${downloadAsVideo ? 'vídeo' : 'áudio'} "${alvoPedido}":`, err)
            await reply(telaErro(err, { alvo: alvoPedido, prefix }))
        }
    }
}

// Para os testes: o cartão de informações, sem precisar rodar o comando inteiro.
Object.defineProperty(module.exports, "_legenda", { value: legendaMidia, enumerable: false })
