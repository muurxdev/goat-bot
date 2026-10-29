/**
 * Layout das mensagens — normaliza o visual de tudo que sai para o usuário.
 *
 * Em 2026-09-15 o dono decidiu tirar as caixas ASCII (╔══╗, ╭━〔 〕━⬣, ┃) de
 * todas as mensagens: elas quebram em celular estreito e deixam o bot com cara
 * de sistema. Mais de 2.000 arquivos montam caixa à mão, muitas com texto
 * dinâmico, então a troca acontece aqui, no ponto de saída (mesmo lugar do
 * tradutor de jargão): cobre o que existe e o que ainda vai ser escrito.
 *
 * Linha a linha:
 *  - linha só de moldura (╔════╗, ╰━━⬣, ┣━━┫) vira linha em branco
 *  - "╭━〔 📋 DETALHES 〕━⬣" vira "📋 *Detalhes*"
 *  - "║  🎬 *VÍDEO BAIXADO* 🎬  ║" vira "🎬 *Vídeo baixado*"
 *  - "┃ ➤ texto" vira "• texto"; "┃ texto" vira "texto"
 *  - título em CAIXA ALTA vira frase, preservando siglas (XP, RPG, PDF) e nomes
 *    próprios (Reino, WhatsApp)
 *  - nunca mais de uma linha em branco seguida
 *
 * Blocos ``` e trechos em crase passam intactos. Tabuleiros com │ ┌ ┐ também,
 * porque ali o desenho é o conteúdo.
 */

const MOLDURA = '╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═─┈⊷⬣┃║'
const SO_MOLDURA = new RegExp(`^[\\s${MOLDURA}]+$`)
const TEM_MOLDURA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]|─{3,}/
const SECAO = /^\s*[╭┏┣]?[━─═]*\s*〔\s*(.+?)\s*〕\s*[━─═]*\s*(?:⬣|┈⊷|╮|┓|┫)?\s*$/
const DIVISOR = /^\s*(\S+\s+)?[═━─]{2,}\s*(.*?\p{L}.*?)\s*[═━─]{2,}\s*$/u
const EMOJI = '\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic})*\\uFE0F?'
const EMOJI_NO_INICIO = new RegExp(`^(${EMOJI})\\s*(.*)$`, 'u')
const EMOJI_DUPLO = new RegExp(`^(${EMOJI})\\s+(.+?)\\s+\\1$`, 'u')

/** Siglas que continuam maiúsculas quando o título vira frase. */
const SIGLAS = new Set([
    'XP', 'RPG', 'VIP', 'PDF', 'MP3', 'MP4', 'M4A', 'HP', 'MP', 'ID', 'PIX', 'QR', 'GIF', 'PNG', 'JPG',
    'IA', 'BR', 'DDD', 'CPF', 'CEP', 'CNPJ', 'IMC', 'TMB', 'TDEE', 'KB', 'MB', 'GB', 'TB', 'HD', 'FPS',
    'UTC', 'BRL', 'USD', 'EUR', 'NPC', 'PVP', 'PVE', 'LVL', 'ATK', 'DEF', 'FAQ', 'SOS', 'TV', 'DJ',
    'GPS', 'ADM', 'ADMS', 'OK', 'PV', 'EUA', 'ONU', 'NBA', 'UFC', 'FIFA', 'CEO', 'PC', 'YT', 'DM',
    'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XX'
])

/** Nomes próprios que recuperam a grafia certa depois de ir para minúsculas. */
const NOMES = new Map([
    'GOAT', 'Reino', 'Barcelona', 'Inter', 'Miami', 'Argentina', 'Campeões', 'Vestiário',
    'Futebol', 'Craque', 'Camisa10', 'WhatsApp', 'YouTube', 'TikTok', 'Instagram', 'Google', 'Drive',
    'Spotify', 'Pinterest', 'Discord', 'Telegram', 'Skycode', 'Brasil', 'Deezer', 'Twitter', 'GOAT',
    'Pecados', 'Capitais', 'Deusas', 'Mandamentos'
].map(n => [n.toLocaleLowerCase('pt-BR'), n]))

function ehMaiuscula(c) {
    return c !== c.toLocaleLowerCase('pt-BR') && c === c.toLocaleUpperCase('pt-BR')
}

/**
 * Diz se o trecho está "gritado": só maiúsculas e com ao menos uma palavra
 * comum de 4+ letras (sigla sozinha, como "XP" ou "PDF", não conta).
 */
function ehGritado(texto) {
    const letras = String(texto || '').match(/\p{L}/gu) || []
    if (letras.length < 4 || !letras.every(ehMaiuscula)) return false
    const palavras = String(texto).match(/\p{L}+/gu) || []
    return palavras.some(p => p.length >= 4 && !SIGLAS.has(p))
}

/** "DETALHES DO VÍDEO EM MP4" → "Detalhes do vídeo em MP4" */
function emFrase(texto) {
    let primeira = true
    return String(texto).replace(/[\p{L}\p{N}]+/gu, (tok) => {
        let saida
        if (/\p{N}/u.test(tok) || SIGLAS.has(tok)) {
            saida = tok
        } else {
            const baixa = tok.toLocaleLowerCase('pt-BR')
            saida = NOMES.get(baixa) ||
                (primeira ? baixa.charAt(0).toLocaleUpperCase('pt-BR') + baixa.slice(1) : baixa)
        }
        primeira = false
        return saida
    })
}

/** Frase só se estiver gritado; caso contrário devolve como veio. */
function tituloEmFrase(texto) {
    return ehGritado(texto) ? emFrase(texto) : String(texto ?? '')
}

/** "📋 *DETALHES*" / "📋 DETALHES" → "📋 *Detalhes*" */
function titulo(bruto) {
    const t = String(bruto).trim()
    const m = t.match(EMOJI_NO_INICIO)
    const emoji = m && m[2] ? m[1] : ''
    let interno = (emoji ? m[2] : t).replace(/\*/g, '').trim()
    // Emoji repetido no fim ("🎬 VÍDEO 🎬") sai junto com a moldura.
    if (emoji && interno.endsWith(emoji)) interno = interno.slice(0, -emoji.length).trim()
    interno = tituloEmFrase(interno)
    return `${emoji ? emoji + ' ' : ''}*${interno}*`
}

/** Aplica a correção de caixa alta fora dos trechos em crase. */
function corrigirCaixaAlta(linha) {
    if (!/\p{Lu}{4}/u.test(linha)) return linha
    return linha.split(/(`[^`]*`)/).map((parte, i) => {
        if (i % 2 === 1 || /https?:\/\//i.test(parte)) return parte
        const comNegrito = parte.replace(/\*([^*\n]+)\*/g, (achado, dentro) =>
            ehGritado(dentro) ? `*${emFrase(dentro)}*` : achado)
        if (comNegrito !== parte) return comNegrito
        // Linha inteira gritada sem negrito ("📊 STATUS DO GRUPO").
        const semMencao = parte.replace(/@\d+/g, '')
        const letras = semMencao.match(/\p{L}/gu) || []
        return letras.length >= 8 && ehGritado(semMencao) ? emFrase(parte) : parte
    }).join('')
}

function normalizarLinha(linha) {
    let l = linha
    if (TEM_MOLDURA.test(l)) {
        if (SO_MOLDURA.test(l)) return ''
        let m = l.match(SECAO)
        if (m) return titulo(m[1])
        m = l.match(DIVISOR)
        if (m) return titulo(`${m[1] || ''}${m[2]}`)
        l = l.replace(/^\s*[┃║┣]\s*/, '').replace(/\s*[┃║┫]\s*$/, '')
    }
    l = l.replace(/^(\s*)[➤►▸]\s+/, '$1• ')
    const duplo = l.trim().match(EMOJI_DUPLO)
    if (duplo) l = `${duplo[1]} ${duplo[2]}`
    return corrigirCaixaAlta(l)
}

/**
 * Normaliza o layout de uma mensagem. Idempotente: aplicar duas vezes dá o
 * mesmo resultado.
 * @param {string} texto
 * @returns {string}
 */
function normalizarLayout(texto) {
    if (typeof texto !== 'string' || !texto) return texto
    if (!TEM_MOLDURA.test(texto) && !/\p{Lu}{4}/u.test(texto) && !/[➤►▸]/.test(texto)) return texto

    const saida = []
    let emCodigo = false
    for (const linha of texto.split('\n')) {
        const cercas = (linha.match(/```/g) || []).length
        if (cercas || emCodigo) {
            saida.push(linha)
            if (cercas % 2 === 1) emCodigo = !emCodigo
            continue
        }
        saida.push(normalizarLinha(linha))
    }

    const final = saida.join('\n').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
    return final || texto
}

module.exports = { normalizarLayout, tituloEmFrase, emFrase, ehGritado }
