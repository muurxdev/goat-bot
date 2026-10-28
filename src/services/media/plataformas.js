/**
 * Qual plataforma é este link — decidido pelo HOST, nunca por pedaço de texto.
 *
 * Até 2026-09-21 cada lugar testava `/twitter\.com|x\.com/.test(link)`. Isso
 * casa com "dropbox.com" (termina em "x.com"), então um link do Dropbox ia para
 * o baixador do Twitter e aparecia como "Twitter (X)"; e `?ref=tiktok.com` num
 * site qualquer virava TikTok. Aqui o host do link é comparado com o domínio
 * (ou subdomínio) de cada plataforma.
 *
 * `tipo` é o que a plataforma costuma entregar, para o aviso de download dizer
 * o que está vindo antes de o arquivo existir.
 */

const logger = require('../../core/logger')

/**
 * @typedef {object} Plataforma
 * @property {string} chave  identificador interno (youtube, tiktok…)
 * @property {string} nome   como aparece para a pessoa
 * @property {string[]} hosts domínios da plataforma
 * @property {string[]} [cdns] servidores de arquivo da plataforma. Dão o NOME,
 *   mas não a chave: link direto de CDN é um arquivo, não uma página, e vai
 *   para o baixador genérico — o da plataforma espera /pin/, /status/ etc.
 * @property {'vídeo'|'áudio'|'imagem'|'arquivo'} tipo o que costuma vir
 */

/** @type {Plataforma[]} */
const PLATAFORMAS = [
    { chave: 'youtubemusic', nome: 'YouTube Music', hosts: ['music.youtube.com'], tipo: 'áudio' },
    { chave: 'youtube', nome: 'YouTube', hosts: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'], cdns: ['ytimg.com', 'googlevideo.com'], tipo: 'vídeo' },
    { chave: 'tiktok', nome: 'TikTok', hosts: ['tiktok.com', 'tt.site'], cdns: ['tiktokcdn.com', 'tiktokv.com'], tipo: 'vídeo' },
    { chave: 'instagram', nome: 'Instagram', hosts: ['instagram.com', 'instagr.am'], cdns: ['cdninstagram.com'], tipo: 'vídeo' },
    { chave: 'facebook', nome: 'Facebook', hosts: ['facebook.com', 'fb.watch', 'fb.com'], cdns: ['fbcdn.net'], tipo: 'vídeo' },
    { chave: 'twitter', nome: 'Twitter (X)', hosts: ['twitter.com', 'x.com', 't.co'], cdns: ['twimg.com'], tipo: 'vídeo' },
    { chave: 'threads', nome: 'Threads', hosts: ['threads.net', 'threads.com'], tipo: 'vídeo' },
    { chave: 'kwai', nome: 'Kwai', hosts: ['kwai.com', 'kwai-video.com', 'kw.ai'], tipo: 'vídeo' },
    { chave: 'pinterest', nome: 'Pinterest', hosts: ['pinterest.com', 'pinterest.com.br', 'pin.it'], cdns: ['pinimg.com'], tipo: 'imagem' },
    { chave: 'reddit', nome: 'Reddit', hosts: ['reddit.com', 'redd.it'], cdns: ['redditmedia.com'], tipo: 'vídeo' },
    { chave: 'soundcloud', nome: 'SoundCloud', hosts: ['soundcloud.com', 'on.soundcloud.com'], cdns: ['sndcdn.com'], tipo: 'áudio' },
    { chave: 'spotify', nome: 'Spotify', hosts: ['spotify.com', 'spotify.link'], tipo: 'áudio' },
    { chave: 'deezer', nome: 'Deezer', hosts: ['deezer.com', 'deezer.page.link'], tipo: 'áudio' },
    { chave: 'applemusic', nome: 'Apple Music', hosts: ['music.apple.com'], tipo: 'áudio' },
    { chave: 'bandcamp', nome: 'Bandcamp', hosts: ['bandcamp.com'], tipo: 'áudio' },
    { chave: 'mixcloud', nome: 'Mixcloud', hosts: ['mixcloud.com'], tipo: 'áudio' },
    { chave: 'audiomack', nome: 'Audiomack', hosts: ['audiomack.com'], tipo: 'áudio' },
    { chave: 'twitch', nome: 'Twitch', hosts: ['twitch.tv'], tipo: 'vídeo' },
    { chave: 'kick', nome: 'Kick', hosts: ['kick.com'], tipo: 'vídeo' },
    { chave: 'vimeo', nome: 'Vimeo', hosts: ['vimeo.com'], tipo: 'vídeo' },
    { chave: 'dailymotion', nome: 'Dailymotion', hosts: ['dailymotion.com', 'dai.ly'], tipo: 'vídeo' },
    { chave: 'bilibili', nome: 'Bilibili', hosts: ['bilibili.com', 'b23.tv'], tipo: 'vídeo' },
    { chave: 'rumble', nome: 'Rumble', hosts: ['rumble.com'], tipo: 'vídeo' },
    { chave: 'streamable', nome: 'Streamable', hosts: ['streamable.com'], tipo: 'vídeo' },
    { chave: 'snapchat', nome: 'Snapchat', hosts: ['snapchat.com'], tipo: 'vídeo' },
    { chave: 'linkedin', nome: 'LinkedIn', hosts: ['linkedin.com'], tipo: 'vídeo' },
    { chave: 'tumblr', nome: 'Tumblr', hosts: ['tumblr.com'], tipo: 'imagem' },
    { chave: 'imgur', nome: 'Imgur', hosts: ['imgur.com'], tipo: 'imagem' },
    { chave: 'giphy', nome: 'Giphy', hosts: ['giphy.com'], tipo: 'vídeo' },
    { chave: '9gag', nome: '9GAG', hosts: ['9gag.com'], tipo: 'vídeo' },
    { chave: 'likee', nome: 'Likee', hosts: ['likee.video', 'likee.com'], tipo: 'vídeo' },
    { chave: 'vk', nome: 'VK', hosts: ['vk.com', 'vkvideo.ru'], tipo: 'vídeo' },
    { chave: 'okru', nome: 'OK.ru', hosts: ['ok.ru'], tipo: 'vídeo' },
    { chave: 'telegram', nome: 'Telegram', hosts: ['t.me', 'telegram.me'], tipo: 'arquivo' },
    { chave: 'gdrive', nome: 'Google Drive', hosts: ['drive.google.com', 'docs.google.com'], tipo: 'arquivo' },
    { chave: 'dropbox', nome: 'Dropbox', hosts: ['dropbox.com', 'dropboxusercontent.com'], tipo: 'arquivo' },
    { chave: 'mediafire', nome: 'MediaFire', hosts: ['mediafire.com'], tipo: 'arquivo' },
    { chave: 'catbox', nome: 'Catbox', hosts: ['catbox.moe'], tipo: 'arquivo' }
]

/** Extensão do arquivo no fim do caminho -> tipo. Link direto para arquivo. */
const TIPO_POR_EXTENSAO = [
    [/\.(mp4|mkv|webm|mov|m4v|avi|3gp|ts|m3u8)$/i, 'vídeo'],
    [/\.(mp3|m4a|aac|opus|ogg|oga|wav|flac|wma)$/i, 'áudio'],
    [/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?)$/i, 'imagem'],
    [/\.(pdf|zip|rar|7z|apk|docx?|xlsx?|pptx?|txt)$/i, 'arquivo']
]

/** Host do link, sem "www." e sem ponto final. null se não for http(s). */
function hostDe(url) {
    try {
        const t = String(url || '').trim()
        if (!/^https?:\/\//i.test(t)) return null
        return new URL(t).hostname.toLowerCase().replace(/\.$/, '').replace(/^www\./, '')
    } catch (err) {
        logger.debug(`[PLATAFORMAS] Endereço ilegível "${String(url).slice(0, 80)}": ${err.message}`)
        return null
    }
}

/** "exemplo-site.com.br" -> "Exemplo-site"; para plataformas fora da lista. */
function nomeDoHost(host) {
    const partes = host.split('.')
    // Tira o sufixo de país/tipo (com.br, co.uk, com, net…) e fica com o nome.
    const semSufixo = partes.length > 2 && /^(com|net|org|gov|edu|co)$/.test(partes[partes.length - 2])
        ? partes.slice(0, -2) : partes.slice(0, -1)
    const nome = semSufixo[semSufixo.length - 1] || host
    return nome.charAt(0).toUpperCase() + nome.slice(1)
}

/**
 * Identifica a plataforma e o tipo de arquivo que o link deve trazer.
 * @param {string} url
 * @returns {{ chave: string, nome: string, tipo: string, host: string|null, conhecida: boolean }}
 */
function identificarLink(url) {
    const host = hostDe(url)
    if (!host) return { chave: 'desconhecida', nome: 'Web', tipo: 'arquivo', host: null, conhecida: false }

    let caminho = ''
    try { caminho = new URL(String(url).trim()).pathname } catch (err) { logger.debug(`[PLATAFORMAS] Sem caminho em ${url}: ${err.message}`) }
    const porExtensao = TIPO_POR_EXTENSAO.find(([re]) => re.test(caminho))

    const casa = h => host === h || host.endsWith('.' + h)
    const cdn = PLATAFORMAS.find(pl => (pl.cdns || []).some(casa))
    if (cdn) {
        return { chave: cdn.chave + ':cdn', nome: cdn.nome, tipo: porExtensao ? porExtensao[1] : cdn.tipo, host, conhecida: true }
    }
    const p = PLATAFORMAS.find(pl => pl.hosts.some(casa))
    if (p) {
        // YouTube Shorts continua vídeo; Pinterest com /video/ ou pin de vídeo
        // só se descobre baixando — o tipo aqui é o palpite antes do download.
        return { chave: p.chave, nome: p.nome, tipo: porExtensao ? porExtensao[1] : p.tipo, host, conhecida: true }
    }
    return { chave: 'generica', nome: nomeDoHost(host), tipo: porExtensao ? porExtensao[1] : 'vídeo', host, conhecida: false }
}

/** Atalho: o link é desta plataforma? (comparação por host) */
function ehPlataforma(url, chave) {
    return identificarLink(url).chave === chave
}

module.exports = { PLATAFORMAS, identificarLink, ehPlataforma, hostDe }
