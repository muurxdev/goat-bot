/**
 * Comando .frasescurtas — FRASES LONGAS
 *
 * Aponta as frases que ficaram grandes demais.
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
    name: 'frasescurtas',
    aliases: ["encurtarfrases"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'Aponta as frases que ficaram grandes demais',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const texto = textoDe(args, quotedText)
    if (!texto) return reply(pedeTexto(prefix, 'frasescurtas'))
    const frases = T.frasesDe(texto).map(f => ({ f, n: T.palavrasDe(f).length })).sort((a, b) => b.n - a.n)
    let doc = cab('FRASES LONGAS', '✂️')
    if (!frases.length) return reply(doc + '_Nenhuma frase identificada._')
    const longas = frases.filter(x => x.n > 25)
    doc += linha('Frases', String(frases.length))
    doc += linha('Acima de 25 palavras', String(longas.length)) + '\n'
    for (const x of frases.slice(0, 5)) {
        doc += '┃ ' + x.n + ' palavras: ' + x.f.slice(0, 60) + '…\n'
    }
    if (longas.length) doc += '\n_Frase acima de 25 palavras costuma perder o leitor no meio._'
    return reply(doc)
    }
}
