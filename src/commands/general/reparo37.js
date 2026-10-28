/**
 * Comando .ferramentas — CAIXA DE FERRAMENTAS
 *
 * Ferramentas básicas, para que servem e o erro comum.
 */

const H = require('../../services/homeRepairService')

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
    name: 'ferramentas',
    aliases: ["caixadeferramentas"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Ferramentas básicas, para que servem e o erro comum',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CAIXA DE FERRAMENTAS', '🛠️')
    doc += linha('Ferramentas', String(Object.keys(H.FERRAMENTAS).length)) + '\n'
    for (const [k, f] of Object.entries(H.FERRAMENTAS)) {
        doc += '┃ *' + f.nome + '*\n┃    ' + f.para + '\n┃    `' + prefix + 'ferramenta' + k + '`\n'
    }
    doc += '\n🔧 _O que consertar com elas:_ `' + prefix + 'reparoscasa`'
    return reply(doc)
    }
}
