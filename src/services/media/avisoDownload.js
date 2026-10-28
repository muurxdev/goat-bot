/**
 * Aviso de que o download começou: reação ⏳ na mensagem de quem pediu e uma
 * frase única, "⏳ Baixando áudio do YouTube…" (ver avisarDownload).
 */

const logger = require('../../core/logger')
const M = require('../../utils/moldura')

const TEMPO_DADOS_MS = 7000       // espera máxima pelos dados do vídeo

/** Promessa que desiste depois de `ms`, devolvendo `padrao` em vez de falhar. */
function comLimite(promessa, ms, padrao = null) {
    let timer
    return Promise.race([
        Promise.resolve(promessa).catch(err => {
            logger.warn(`[AVISO DOWNLOAD] dados indisponíveis: ${err.message}`)
            return padrao
        }),
        new Promise(r => { timer = setTimeout(() => r(padrao), ms) })
    ]).finally(() => clearTimeout(timer))
}

/**
 * Título, autor e duração do link, para o aviso dizer o que está baixando.
 *
 * A busca da miniatura em alta saiu daqui junto com a foto do aviso: era um
 * pedido de rede a cada download para uma imagem que ninguém mais vê.
 * @returns {Promise<{title?:string, author?:string, durationFormatted?:string}>}
 */
async function obterPrevia(url, { userJid = null } = {}) {
    const { extractMetadata } = require('./mediaResolver')
    // TikTok: o yt-dlp é bloqueado pelo site; os dados vêm da mesma API que o
    // download usa (consulta compartilhada, então a API é chamada uma vez só).
    if (require('./plataformas').ehPlataforma(url, 'tiktok')) {
        const { infoTikTok } = require('./providers/tiktok')
        return (await comLimite(infoTikTok(url), TEMPO_DADOS_MS)) || {}
    }
    // Spotify: o yt-dlp não abre; o leitor próprio (embed/oEmbed) é rápido.
    if (require('./plataformas').ehPlataforma(url, 'spotify')) {
        const { resolveSpotifyMetadata } = require('../audioStreamService')
        const sp = await comLimite(resolveSpotifyMetadata(url), TEMPO_DADOS_MS)
        return { title: sp?.title ? [sp.title, sp.author].filter(Boolean).join(' — ') : null, author: sp?.author || null }
    }
    const meta = await comLimite(extractMetadata(url, { timeoutMs: TEMPO_DADOS_MS, userJid }), TEMPO_DADOS_MS)
    return {
        title: meta?.title || null,
        author: meta?.author || null,
        durationFormatted: meta?.durationFormatted || null
    }
}

const valido = v => {
    const s = String(v || '').trim()
    return s && s !== '—' && !/^desconhecido$/i.test(s) ? s : ''
}

/** Emoji e artigo de cada tipo de arquivo, para o cabeçalho do aviso. */
const TIPOS = {
    'vídeo': { emoji: '🎬', frase: 'o vídeo' },
    'áudio': { emoji: '🎵', frase: 'o áudio' },
    'imagem': { emoji: '🖼️', frase: 'a imagem' },
    'fotos': { emoji: '📸', frase: 'as fotos' },
    // Pinterest e afins: só se sabe depois de baixar.
    'imagem ou vídeo': { emoji: '🖼️', frase: 'a mídia' },
    'arquivo': { emoji: '📦', frase: 'o arquivo' }
}

/**
 * Legenda do aviso, em moldura. Sempre diz DE ONDE vem e O QUE vem (tipo de
 * arquivo), mesmo sem título: pedido do dono em 2026-09-21 — qualquer link
 * reconhecido mostra a plataforma e o tipo sendo baixado.
 */
function legendaDoAviso({ isAudio, tipo, plataforma, previa = {}, textoFinal }) {
    const t = TIPOS[tipo] || TIPOS[isAudio ? 'áudio' : 'vídeo']
    const nomeTipo = tipo && TIPOS[tipo] ? tipo : (isAudio ? 'áudio' : 'vídeo')
    const linhas = []
    const campo = (emoji, rotulo, valor) => { if (valido(valor)) linhas.push(`${emoji} *${rotulo}:* ${valido(valor)}`) }
    campo('📱', 'Plataforma', plataforma)
    campo(t.emoji, 'Tipo', nomeTipo.charAt(0).toUpperCase() + nomeTipo.slice(1))
    campo('📝', 'Título', previa.title && String(previa.title).slice(0, 100))
    campo('👤', 'Autor', previa.author)
    campo('⏱️', 'Duração', previa.durationFormatted)
    return [
        M.cabecalho('⏳', `Baixando ${t.frase}`),
        M.secao('📥', 'Download em andamento', linhas),
        `💡 _${textoFinal || 'Mando assim que ficar pronto, na maior qualidade disponível.'}_`
    ].filter(Boolean).join('\n\n')
}

/**
 * Reage à mensagem de quem pediu. Detalhe visual: falha aqui nunca derruba nada.
 * @param {object} client
 * @param {string} from
 * @param {object} info   mensagem original (a que recebe a reação)
 * @param {string} emoji  '⏳' baixando · '✅' entregue · '❌' falhou
 */
async function reagir(client, from, info, emoji) {
    if (!client?.sendMessage || !from || !info?.key) return false
    try {
        await client.sendMessage(from, { react: { text: emoji, key: info.key } })
        return true
    } catch (err) {
        logger.warn(`[AVISO DOWNLOAD] Reação ${emoji} não saiu em ${from}: ${err.message}`)
        return false
    }
}

/**
 * A plataforma que vai na frase. Link conhecido: o HOST decide (plataformas.js) — o dado que o
 * extrator devolve ("youtube", "Youtube"…) não é confiável para o nome. Sem link: o nome dado,
 * com a grafia oficial se for uma plataforma conhecida ("youtube" → "YouTube").
 */
function plataformaDoPedido(alvo, informada = '') {
    const { identificarLink, PLATAFORMAS } = require('./plataformas')
    if (/^https?:\/\//i.test(alvo)) {
        const l = identificarLink(alvo)
        if (l.conhecida || !informada) return l.nome
    }
    const nome = String(informada || '').trim()
    if (!nome) return ''
    const baixo = nome.toLowerCase()
    const oficial = PLATAFORMAS.find(p => String(p.nome).toLowerCase() === baixo || String(p.chave).toLowerCase() === baixo)
    return oficial ? oficial.nome : nome
}

/** O tipo como entra na frase: o nome conhecido, ou o padrão pelo isAudio. */
const nomeDoTipo = (tipo, isAudio) => (tipo && TIPOS[tipo] ? tipo : (isAudio ? 'áudio' : 'vídeo'))

// Um pedido, um aviso. Vários comandos avisam na busca por nome e de novo quando os dados do
// vídeo chegam; sem isto a pessoa recebia "Baixando vídeo do YouTube…" duas vezes. A chave é a
// mensagem de quem pediu. Sem `info` (teste, chamada antiga) não há como identificar: não filtra.
const AVISOS_TTL_MS = 10 * 60 * 1000
const avisados = new Map()

/** true se este pedido já recebeu o aviso; senão marca como avisado. */
function jaAvisou(from, info) {
    const id = info?.key?.id
    if (!id) return false
    const agora = Date.now()
    for (const [k, t] of avisados) {
        if (agora - t > AVISOS_TTL_MS) avisados.delete(k)
        else break // inserção em ordem: o resto é mais novo
    }
    const chave = `${from}|${id}`
    if (avisados.has(chave)) return true
    avisados.set(chave, agora)
    return false
}

/**
 * Avisa que o download começou: reação ⏳ na mensagem de quem pediu e UMA linha
 * curta, sem cartão, sem título e sem foto:
 *
 *   ⏳ Baixando áudio do YouTube…
 *   ⏳ Baixando vídeo do TikTok…
 *
 * Histórico: foto com miniatura (18–20/09), cartão em moldura (20–21/09), só
 * reação (21/09), "🎬 *Vídeo do TikTok*" + nome (21/09 a 15/10). Em 2026-10-15 o
 * dono pediu esta frase: o tipo e a plataforma entram na própria frase, e o nome
 * da mídia fica para a ficha que chega com ela. Sem buscar título, o aviso sai
 * na hora (antes esperava até 7 s pelos dados do vídeo).
 *
 * @param {object} o
 * @param {object} [o.client]
 * @param {string} [o.from]
 * @param {object} [o.info]       mensagem de quem pediu (recebe a reação)
 * @param {Function} [o.reply]    manda a linha na conversa
 * @param {string} [o.url]        link pedido (dá a plataforma quando ela não vem)
 * @param {object} [o.meta]       dados já conhecidos (só a URL é usada)
 * @param {boolean} [o.isAudio]
 * @param {string} [o.tipo]       'vídeo' | 'áudio' | 'imagem' | 'imagem ou vídeo' | 'fotos' | 'arquivo'
 * @param {string} [o.plataforma] sem ela, sai do host do link
 * @returns {Promise<boolean>} true se a linha saiu
 */
async function avisarDownload({ client, from, info, reply, url, meta, isAudio = false, tipo = null, plataforma = '' } = {}) {
    if (jaAvisou(from, info)) return false
    await reagir(client, from, info, '⏳')
    if (typeof reply !== 'function') return false

    const alvo = url || meta?.webpageUrl || meta?.url || ''
    plataforma = plataformaDoPedido(alvo, plataforma)
    const nomeTipo = nomeDoTipo(tipo, isAudio)

    try {
        await reply(`⏳ Baixando ${nomeTipo}${plataforma ? ` do ${plataforma}` : ''}…`)
        return true
    } catch (err) {
        logger.warn(`[AVISO DOWNLOAD] O aviso não saiu em ${from}: ${err.message}`)
        return false
    }
}

/**
 * Pedido por NOME (sem link): reação ⏳ e a mesma frase do link — "⏳ Baixando
 * áudio do YouTube…". Sem `tipo` (o comando não sabe se vai ser áudio ou vídeo),
 * sai sem ele: "⏳ Baixando do YouTube…". O termo pedido não aparece: quem
 * identifica a mídia é a ficha que chega com ela.
 * @returns {Promise<void>}
 */
async function avisarBusca({ client, from, info, reply, tipo = null, plataforma = 'YouTube' } = {}) {
    if (jaAvisou(from, info)) return
    await reagir(client, from, info, '⏳')
    if (typeof reply !== 'function') return
    const nomeTipo = tipo && TIPOS[tipo] ? ` ${tipo}` : ''
    try {
        await reply(`⏳ Baixando${nomeTipo} do ${plataforma}…`)
    } catch (err) {
        logger.warn(`[AVISO DOWNLOAD] O aviso de busca não saiu em ${from}: ${err.message}`)
    }
}

/**
 * Pesquisa que NÃO baixa nada (a pessoa vai escolher entre as opções): "🔎 Pesquisando
 * *termo* no YouTube…". É a única que mostra o termo, porque aqui não há ficha depois.
 * @returns {Promise<void>}
 */
async function avisarPesquisa({ client, from, info, reply, termo, plataforma = 'YouTube' } = {}) {
    await reagir(client, from, info, '⏳')
    if (typeof reply !== 'function') return
    const t = valido(termo)
    try {
        await reply(t ? `🔎 Pesquisando *${t.slice(0, 80)}* no ${plataforma}…` : `🔎 Pesquisando no ${plataforma}…`)
    } catch (err) {
        logger.warn(`[AVISO DOWNLOAD] O aviso de pesquisa não saiu em ${from}: ${err.message}`)
    }
}

module.exports = { avisarDownload, avisarBusca, avisarPesquisa, reagir, obterPrevia, legendaDoAviso }
