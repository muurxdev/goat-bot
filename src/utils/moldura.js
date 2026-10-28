/**
 * Moldura das mensagens — o visual de caixas do bot.
 *
 * Em 2026-09-18 o dono pediu a volta das caixas (tinham saído em 2026-09-15):
 *
 *   ╔══════════════════════════════╗
 *   ║   🎬 *VÍDEO BAIXADO* 🎬   ║
 *   ╚══════════════════════════════╝
 *
 *   ╭━〔 🌐 DETALHES DA MÍDIA 〕━⬣
 *   ┃ 📱 *Plataforma:* TikTok
 *   ┃ ➤ item de lista
 *   ╰━━━━━━━━━━━━━━━━━━⬣
 *
 *   👑 *Nome do bot*
 *
 * Todo gerador de tela (formato.js, ui.js, uiEngine.js, menu, legenda de mídia)
 * desenha por aqui, para o desenho ser um só.
 */

const BARRA_TOPO = '═'.repeat(30)
const FECHA = '╰' + '━'.repeat(18) + '⬣'

/** Título de moldura: sem asterisco solto e em MAIÚSCULAS (o que está em crase fica). */
function maiusculas(texto) {
    return String(texto ?? '')
        .replace(/\*/g, '')
        .trim()
        .split(/(`[^`]*`)/)
        .map(parte => parte.startsWith('`') ? parte : parte.toLocaleUpperCase('pt-BR'))
        .join('')
}

/** Caixa de cabeçalho com o emoji dos dois lados. */
function cabecalho(emoji, titulo) {
    const e = emoji ? String(emoji).trim() : ''
    const meio = e ? `${e} *${maiusculas(titulo)}* ${e}` : `*${maiusculas(titulo)}*`
    return `╔${BARRA_TOPO}╗\n║   ${meio}   ║\n╚${BARRA_TOPO}╝`
}

/** Linha que abre a seção: "╭━〔 📋 TÍTULO 〕━⬣". */
function abreSecao(emoji, titulo) {
    const e = emoji ? String(emoji).trim() + ' ' : ''
    return `╭━〔 ${e}${maiusculas(titulo)} 〕━⬣`
}

/**
 * Uma linha de conteúdo dentro da seção. "• x" vira "┃ ➤ x"; linha vazia vira
 * "┃"; texto com quebra de linha tem cada pedaço prefixado.
 */
function linhaDeSecao(linha) {
    return String(linha).split('\n').map(l => {
        const t = l.replace(/\s+$/, '')
        if (!t.trim()) return '┃'
        const item = t.match(/^\s*[•➤▸\-]\s+(.*)$/)
        return item ? `┃ ➤ ${item[1]}` : `┃ ${t.replace(/^┃\s?/, '')}`
    }).join('\n')
}

/** Seção completa. Some por inteiro se não houver linha. */
function secao(emoji, titulo, linhas = []) {
    const ls = (Array.isArray(linhas) ? linhas : [linhas])
        .filter(l => l !== null && l !== undefined && String(l).trim() !== '')
    if (!ls.length) return ''
    return [abreSecao(emoji, titulo), ...ls.map(linhaDeSecao), FECHA].join('\n')
}

/** Assinatura com o nome atual do bot. */
function assinatura(nome) {
    let n = nome
    if (!n) {
        try {
            n = require('../config/botConfig').getBotName()
        } catch (err) {
            require('../core/logger').warn(`[MOLDURA] Sem nome do bot para a assinatura: ${err.message}`)
            n = 'Bot'
        }
    }
    return `👑 *${n}*`
}

module.exports = { cabecalho, abreSecao, linhaDeSecao, secao, assinatura, maiusculas, FECHA, BARRA_TOPO }
