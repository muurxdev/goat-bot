/**
 * UI compartilhada — o mesmo visual do .menu central para telas de lista e
 * submenu (conquistas, badges, ranking, etc.).
 *
 * Desenha com as caixas de utils/moldura.js, que voltaram em 2026-09-18
 * (decisão do dono).
 */

const M = require('./moldura')

const EMOJI_NA_PONTA = /^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*️?)\s*/u
const EMOJI_NO_FIM = /\s*\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*️?$/u

/**
 * Separa "🔢 *ROMANO* 🔢" em emoji e título. Os comandos passam o título já
 * enfeitado de vários jeitos; a moldura precisa das duas partes soltas.
 */
function partesDoTitulo(title, icon = '') {
    let t = String(title ?? '').replace(/\*/g, '').trim()
    let emoji = icon
    const m = t.match(EMOJI_NA_PONTA)
    if (m) {
        emoji = emoji || m[1]
        t = t.slice(m[0].length)
    }
    t = t.replace(EMOJI_NO_FIM, '').trim()
    return { emoji, texto: t }
}

/** Cabeçalho da tela. */
function header(title) {
    const { emoji, texto } = partesDoTitulo(title)
    return `${M.cabecalho(emoji, texto)}\n\n`
}

/** Uma linha de conteúdo dentro de uma seção. */
function line(text) {
    return `${M.linhaDeSecao(text)}\n`
}

/** Uma linha com marcador de comando/ação. */
function bullet(text) {
    return `┃ ➤ ${text}\n`
}

/**
 * Bloco de seção com título e linhas.
 * @param {string} title
 * @param {string[]} lines  já formatadas OU linhas cruas
 * @param {string} [icon]
 */
function section(title, lines = [], icon = '📌') {
    // O emoji escrito no título ganha do ícone padrão.
    const { emoji, texto } = partesDoTitulo(title)
    return `${M.secao(emoji || icon, texto, lines)}\n`
}

/** Rodapé padrão com o nome atual do bot. */
function footer(botName) {
    return M.assinatura(botName)
}

/**
 * Monta uma tela completa no estilo do menu.
 * @param {object} o
 * @param {string} o.title
 * @param {Array<{title:string, icon?:string, lines:string[]}>} [o.sections]
 * @param {string} [o.intro]  texto entre o header e as seções
 * @param {string} [o.hint]   dica final (antes do rodapé)
 * @param {boolean} [o.withFooter=true]
 */
function screen({ title, sections = [], intro = '', hint = '', withFooter = true }) {
    let doc = header(title)
    if (intro) doc += intro.trim() + '\n\n'
    for (const s of sections) {
        if (!s || !s.lines || !s.lines.length) continue
        doc += section(s.title, s.lines, s.icon) + '\n'
    }
    if (hint) doc += `💡 ${hint}\n\n`
    if (withFooter) doc += footer()
    return doc.replace(/\n{3,}/g, '\n\n').trim()
}

module.exports = { header, line, bullet, section, footer, screen, partesDoTitulo }
