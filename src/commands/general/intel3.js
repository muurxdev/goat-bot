/**
 * Comando .legibilidade — LEGIBILIDADE
 *
 * O quanto o texto é fácil de ler.
 */

const T = require('../../services/textAnalysisService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

/** Texto a analisar: argumentos ou a mensagem respondida. */
function textoDe(args, quotedText) {
    const a = (args || []).join(' ').trim()
    return a || String(quotedText || '').trim()
}
function pedeTexto(prefix, cmd) {
    return '📝 *Preciso de um texto.*\n\nEnvie junto ao comando ou responda a uma mensagem.\n\n📌 Exemplo: `' + prefix + cmd + ' seu texto aqui`'
}
function listaBarras(itens, rotuloDe, valorDe, largura) {
    if (!itens.length) return '_nada a mostrar_\n'
    const maior = valorDe(itens[0]) || 1
    let t = ''
    for (const i of itens) {
        const n = valorDe(i)
        t += '┃ ' + String(rotuloDe(i)).slice(0, largura).padEnd(largura + 1) + '█'.repeat(Math.max(1, Math.round(n / maior * 10))) + ' ' + n + '\n'
    }
    return t
}

module.exports = {
    name: 'legibilidade',
    aliases: ["facilidadeleitura"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'O quanto o texto é fácil de ler',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const texto = textoDe(args, quotedText)
    if (!texto) return reply(pedeTexto(prefix, 'legibilidade'))
    const l = T.legibilidade(texto)
    let doc = cab('LEGIBILIDADE', '📖')
    if (l.indice === null) return reply(doc + '_' + l.nivel + '._')
    doc += linha('Índice', l.indice.toFixed(0) + '/100')
    doc += linha('Nível', l.nivel)
    doc += linha('Palavras por frase', l.palavrasPorFrase.toFixed(1))
    doc += linha('Sílabas por palavra', l.silabasPorPalavra.toFixed(2))
    doc += '\n' + barra(l.indice / 100) + '\n'
    doc += '\n_' + (l.indice >= 50
        ? 'Texto acessível — qualquer um do grupo entende.'
        : 'Texto pesado. Frases mais curtas e palavras mais simples ajudam.') + '_'
    return reply(doc)
    }
}
