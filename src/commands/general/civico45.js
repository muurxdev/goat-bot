/**
 * Comando .telefonesuteis — TELEFONES DE EMERGÊNCIA
 *
 * Números nacionais de emergência e quando usar.
 */

const C = require('../../services/civicService')

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
    name: 'telefonesuteis',
    aliases: ["emergencia"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Números nacionais de emergência e quando usar',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('TELEFONES DE EMERGÊNCIA', '☎️')
    for (const t of C.TELEFONES) {
        doc += '┃ *' + t.numero + '* — ' + t.servico + '\n┃    ' + t.quando + '\n'
    }
    doc += '\n_Todos gratuitos, funcionam mesmo sem crédito no celular._'
    return reply(doc)
    }
}
