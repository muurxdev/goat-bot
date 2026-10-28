/**
 * Comando .tiposcontrato — TIPOS DE CONTRATO
 *
 * Todas as formas de contratação e o que cada uma dá.
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
    name: 'tiposcontrato',
    aliases: ["contratos"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Todas as formas de contratação e o que cada uma dá',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('TIPOS DE CONTRATO', '📄')
    doc += linha('Tipos', String(Object.keys(L.CONTRATOS).length)) + '\n'
    for (const [k, c] of Object.entries(L.CONTRATOS)) {
        doc += '┃ *' + c.nome + '*\n┃    ' + c.duracao + '\n┃    `' + prefix + 'contrato' + k + '`\n'
    }
    doc += '\n⚠️ _O contrato PJ é o único da lista sem direitos celetistas:_ `' + prefix + 'contratopj`'
    return reply(doc)
    }
}
