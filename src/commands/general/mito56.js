/**
 * Comando .criaturakraken — KRAKEN
 *
 * Criatura mitológica: Kraken.
 */

const M = require('../../services/mythologyService')

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
    name: 'criaturakraken',
    aliases: ["bestakraken"],
    category: 'general',
    subcategory: 'Mitologia',
    description: 'Criatura mitológica: Kraken',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = M.CRIATURAS['kraken']
    let doc = cab("KRAKEN", '🐉')
    doc += linha('Origem', c.origem)
    doc += linha('Tipo', c.tipo)
    doc += linha('Perigo', c.perigo)
    doc += linha('Ponto fraco', c.ponto)
    doc += sep()
    doc += '📜 *A lenda*\n' + c.historia
    doc += '\n\n🐉 _Bestiário completo:_ `' + prefix + 'bestiario`'
    return reply(doc)
    }
}
