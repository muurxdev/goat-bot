/**
 * Comando .figuranise — NISE DA SILVEIRA
 *
 * Quem foi Nise da Silveira.
 */

const B = require('../../services/brazilHistoryService')

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
    name: 'figuranise',
    aliases: ["quemfoinise"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Quem foi Nise da Silveira',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = B.FIGURAS['nise']
    let doc = cab("NISE DA SILVEIRA", '👤')
    doc += linha('Viveu', f.viveu)
    doc += linha('Papel', f.papel)
    doc += sep()
    doc += '📖 *O que fez*\n' + f.fez + '\n\n'
    doc += '🏛️ *O que ficou*\n' + f.legado + '\n\n'
    doc += '👥 _Todas as figuras:_ `' + prefix + 'figurashistoria`'
    return reply(doc)
    }
}
