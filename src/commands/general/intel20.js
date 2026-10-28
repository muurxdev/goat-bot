/**
 * Comando .densidadetermo — DENSIDADE DE UM TERMO
 *
 * Quanto uma palavra ocupa do texto.
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
    name: 'densidadetermo',
    aliases: ["densidadepalavra"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'Quanto uma palavra ocupa do texto',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const bruto = textoDe(args, quotedText)
    const termo = String(args[0] || '').toLowerCase()
    const texto = quotedText || args.slice(1).join(' ')
    if (!termo || !texto) return reply('🎯 📌 Uso: `' + prefix + 'densidadetermo reino <texto>`\n\n_Ou responda a uma mensagem informando só o termo._')
    const palavras = T.palavrasDe(texto)
    const n = palavras.filter(p => p === termo).length
    let doc = cab('DENSIDADE DE UM TERMO', '🎯')
    doc += linha('Termo', termo)
    doc += linha('Ocorrências', String(n))
    doc += linha('Total de palavras', String(palavras.length))
    doc += linha('Densidade', palavras.length ? ((n / palavras.length) * 100).toFixed(2) + '%' : '0%')
    if (palavras.length && (n / palavras.length) > 0.05) doc += '\n🟡 _Acima de 5% costuma soar repetitivo._'
    return reply(doc)
    }
}
