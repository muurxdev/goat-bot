/**
 * Peças comuns da ficha que acompanha TODA mídia (áudio, vídeo, imagem; qualquer plataforma).
 *
 * A ficha era montada em três lugares diferentes (`.play`, `.spotify` e `formatMediaCaption`, que
 * serve TikTok, Instagram, X, Kwai, Pinterest, SoundCloud…), cada um com um conjunto de campos: o
 * áudio do Spotify saía sem origem, sem tipo, sem data e com próximos passos de outro comando.
 * Pedido do dono (2026-10-15): toda mídia diz de onde veio, o tipo, quando foi postada e quais são
 * os próximos passos do comando que ela usou.
 *
 * Aqui ficam só as decisões que os três precisam tomar igual: a origem e os próximos passos.
 */

const { identificarLink } = require('./plataformas')

/** Comando próprio de cada plataforma (as que não têm usam o `.media`). */
const COMANDO_POR_CHAVE = {
    youtube: 'play',
    youtubemusic: 'play',
    tiktok: 'tiktok',
    instagram: 'insta',
    twitter: 'twitter',
    kwai: 'kwai',
    pinterest: 'pinterest',
    spotify: 'spotify',
    soundcloud: 'soundcloud',
    reddit: 'reddit'
}

/** Nome da plataforma como as fichas mostram -> chave de plataformas.js. */
const CHAVE_POR_NOME = {
    youtube: 'youtube', 'youtube music': 'youtubemusic', tiktok: 'tiktok', instagram: 'instagram',
    'twitter/x': 'twitter', twitter: 'twitter', x: 'twitter', kwai: 'kwai', pinterest: 'pinterest',
    spotify: 'spotify', soundcloud: 'soundcloud', reddit: 'reddit'
}

const semValor = v => {
    const t = String(v || '').trim()
    return !t || t === '—' || /^(web|desconhecido|desconhecida)$/i.test(t)
}

/**
 * De onde a mídia veio: o nome dado, ou o da plataforma do link. Vazio se não dá para saber.
 * @param {{plataforma?: string, url?: string}} o
 * @returns {string}
 */
function origemDe({ plataforma = '', url = '' } = {}) {
    if (!semValor(plataforma)) return String(plataforma).trim()
    if (/^https?:\/\//i.test(String(url || ''))) {
        const nome = identificarLink(String(url)).nome
        if (!semValor(nome)) return nome
    }
    return ''
}

/** "áudio" | "vídeo" | "imagem" -> como a ficha escreve o tipo. */
function rotuloDoTipo(tipo) {
    const t = String(tipo || '').toLowerCase()
    if (t.startsWith('á') || t === 'audio') return 'Áudio'
    if (t.startsWith('i')) return 'Imagem'
    return 'Vídeo'
}

/**
 * Próximos passos do comando que a pessoa usou, para esta mídia.
 *
 *   YouTube/Spotify/nome → .play mp4 <nome> · .play capa <nome> · .play search <nome>
 *   TikTok/Insta/X/Kwai  → .tiktok mp3 <link> (ou o vídeo, se a ficha é de áudio) …
 *   outros               → .media mp3|mp4 <link>
 *
 * @param {object} o
 * @param {'áudio'|'vídeo'|'imagem'} o.tipo
 * @param {string} [o.plataforma]
 * @param {string} [o.url]      link de origem
 * @param {string} [o.titulo]
 * @param {string} [o.pedido]   o que a pessoa digitou (nome)
 * @param {boolean} [o.emLista] faixa de playlist: repetir próximos passos em toda faixa vira ruído
 * @returns {Array<{nome: string, args: string, oque: string}>}
 */
function proximosDe({ tipo = 'vídeo', plataforma = '', url = '', titulo = '', pedido = '', emLista = false } = {}) {
    if (emLista) return []
    const link = /^https?:\/\//i.test(String(url || '')) ? String(url).trim() : ''
    const chave = (link ? identificarLink(link).chave : null) || CHAVE_POR_NOME[String(plataforma || '').trim().toLowerCase()] || ''
    const comando = COMANDO_POR_CHAVE[chave] || 'media'
    const nome = String(titulo || pedido || '').replace(/\s+/g, ' ').trim().slice(0, 60)
    const ehAudio = rotuloDoTipo(tipo) === 'Áudio'
    const ehImagem = rotuloDoTipo(tipo) === 'Imagem'
    const itens = []

    // YouTube e Spotify: pelo nome (o link do YouTube é longo e o nome já acha o mesmo vídeo).
    if (comando === 'play' || comando === 'spotify') {
        if (nome) {
            if (ehAudio) {
                itens.push({ nome: 'play', args: `mp4 ${nome}`, oque: 'o clipe em vídeo' })
                itens.push({ nome: 'play', args: `capa ${nome}`, oque: 'a capa em alta' })
            } else if (!ehImagem) {
                itens.push({ nome: comando === 'spotify' ? 'spotify' : 'play', args: nome, oque: 'só o áudio' })
                itens.push({ nome: 'play', args: `capa ${nome}`, oque: 'a capa em alta' })
            }
            itens.push({ nome: 'play', args: `search ${nome}`, oque: 'ver outras opções' })
        }
        return itens
    }

    // Demais plataformas: o próprio comando dela, com o link (ou <link> se for longo demais).
    const alvo = link && link.length <= 70 ? link : '<link>'
    // SoundCloud é só áudio; imagem não tem "outro formato".
    if (ehImagem || comando === 'soundcloud') return itens
    if (ehAudio) {
        itens.push({ nome: comando, args: comando === 'media' ? `mp4 ${alvo}` : alvo, oque: 'o vídeo' })
    } else {
        itens.push({ nome: comando, args: `mp3 ${alvo}`, oque: 'só o áudio' })
    }
    return itens
}

/** O YouTube Music nomeia o canal gerado de "Artista - Topic": na ficha vale só o artista. */
function limparArtista(autor) {
    return String(autor || '').replace(/\s*-\s*Topic\s*$/i, '').trim()
}

module.exports = { origemDe, rotuloDoTipo, proximosDe, limparArtista, COMANDO_POR_CHAVE }
