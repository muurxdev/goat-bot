/**
 * Comando .tiposrescisao — COMPARAR AS SAÍDAS
 *
 * Todas as formas de rescisão lado a lado.
 */

const L = require('../../services/laborService')

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


module.exports = {
    name: 'tiposrescisao',
    aliases: ["comparardemissao"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Todas as formas de rescisão lado a lado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('COMPARAR AS SAÍDAS', '🚪')
    doc += linha('Formas', String(Object.keys(L.TIPOS_RESCISAO).length))
    doc += sep()
    for (const [k, t] of Object.entries(L.TIPOS_RESCISAO)) {
        doc += '┃ *' + t.nome + '*\n'
        doc += '┃    multa FGTS: ' + (t.multaFgts || 0) + '% · saque: ' + (t.saqueFgts || 0) + '% · seguro: ' + (t.seguro ? 'sim' : 'não') + '\n'
        doc += '┃    `' + prefix + 'saida' + k + '`\n'
    }
    doc += '\n🧮 _Calcular a sua:_ `' + prefix + 'rescisao 3000 26 semjustacausa`'
    return reply(doc)
    }
}
