/**
 * Comando .resumirtexto — RESUMO POR EXTRAÇÃO
 *
 * Escolhe as frases mais representativas do texto.
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
    name: 'resumirtexto',
    aliases: ["resumoextraido"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'Escolhe as frases mais representativas do texto',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const texto = textoDe(args, quotedText)
    if (!texto) return reply(pedeTexto(prefix, 'resumirtexto'))
    const m = T.medidas(texto)
    if (m.frases < 3) return reply('📄 O texto precisa ter ao menos 3 frases para resumir.')
    const quantas = Math.min(5, Math.max(1, Math.ceil(m.frases / 4)))
    const frases = T.resumir(texto, quantas)
    let doc = cab('RESUMO POR EXTRAÇÃO', '📄')
    doc += linha('Original', m.frases + ' frases, ' + m.palavras + ' palavras')
    doc += linha('Resumo', frases.length + ' frases') + '\n'
    for (const f of frases) doc += '▫️ ' + f + '\n'
    doc += '\n_As frases são do próprio texto — nada foi inventado._'
    return reply(doc)
    }
}
