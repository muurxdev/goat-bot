/**
 * Comando .intelocorrencias — CONTAR OCORRÊNCIAS
 *
 * Quantas vezes um termo aparece no texto.
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
    name: 'intelocorrencias',
    aliases: ["ocorrenciastermo"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'Quantas vezes um termo aparece no texto',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const termo = String(args[0] || '').toLowerCase()
    const texto = quotedText || args.slice(1).join(' ')
    if (!termo || !texto) return reply('🔍 📌 Uso: `' + prefix + 'intelocorrencias reino <texto>`')
    const palavras = T.palavrasDe(texto)
    const exatas = palavras.filter(p => p === termo).length
    const parciais = palavras.filter(p => p.includes(termo)).length
    let doc = cab('CONTAR OCORRÊNCIAS', '🔍')
    doc += linha('Termo', termo)
    doc += linha('Palavra exata', String(exatas))
    doc += linha('Contendo o termo', String(parciais))
    doc += linha('Total de palavras', String(palavras.length))
    return reply(doc)
    }
}
