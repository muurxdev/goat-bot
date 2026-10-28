/**
 * Comando .ferramentachavefenda — CHAVE DE FENDA E PHILLIPS
 *
 * Ferramenta: Chave de fenda e Phillips — para que serve e como usar.
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
    name: 'ferramentachavefenda',
    aliases: ["usarchavefenda"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Ferramenta: Chave de fenda e Phillips — para que serve e como usar',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = H.FERRAMENTAS['chavefenda']
    let doc = cab("CHAVE DE FENDA E PHILLIPS", '🛠️')
    doc += linha('Serve para', f.para)
    doc += linha('Custo', f.preco)
    doc += sep()
    doc += '✅ *Como usar direito*\n' + f.como + '\n\n'
    doc += '❌ *O erro mais comum*\n' + f.erro + '\n\n'
    doc += '🛠️ _Caixa de ferramentas:_ `' + prefix + 'ferramentas`'
    return reply(doc)
    }
}
