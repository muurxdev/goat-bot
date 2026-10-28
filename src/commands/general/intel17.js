/**
 * Comando .compararetextos — COMPARAR TEXTOS
 *
 * Mede o quanto dois textos se parecem.
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
    name: 'compararetextos',
    aliases: ["semelhancatextos"],
    category: 'general',
    subcategory: 'Análise de Texto',
    description: 'Mede o quanto dois textos se parecem',
    usage: '<texto 1> | <texto 2>',
    examples: ['o gato subiu | o gato desceu — mostra a semelhança e as diferenças'],
    cooldownMs: 2500,
    execute: async ({ reply, args = [], quotedText, prefix = '.' }) => {
    const bruto = textoDe(args, quotedText)
    if (!bruto.includes('|')) {
        return reply('⚖️ *Comparar textos*\n\n' +
            'Eu meço o quanto dois textos se parecem e mostro as palavras em comum e as que só aparecem em um deles.\n\n' +
            '✍️ *Digite assim*\n' +
            '• `' + prefix + 'compararetextos primeiro texto | segundo texto`\n' +
            '• `' + prefix + 'compararetextos o gato subiu no muro | o gato desceu do muro`\n\n' +
            '💡 _A barra | separa um texto do outro. Também dá para responder a uma mensagem que já tenha a barra._\n\n' +
            '👉 *Próximos passos*\n' +
            '• `' + prefix + 'comparartexto texto 1 | texto 2` — comparação explicada em frases')
    }
    const [a, b] = bruto.split('|')
    const c = T.comparar(a, b)
    let doc = cab('COMPARAR TEXTOS', '⚖️')
    doc += linha('Semelhança', c.semelhanca.toFixed(1) + '%')
    doc += '\n' + barra(c.semelhanca / 100) + '\n'
    if (c.comuns.length) doc += '\n' + bloco('🤝 EM COMUM', [c.comuns.join(', ')])
    if (c.soA.length) doc += '\n' + bloco('1️⃣ SÓ NO PRIMEIRO', [c.soA.join(', ')])
    if (c.soB.length) doc += '\n' + bloco('2️⃣ SÓ NO SEGUNDO', [c.soB.join(', ')])
    return reply(doc)
    }
}
