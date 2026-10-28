/**
 * Comando .nutrientesodio — SÓDIO
 *
 * Sódio: para que serve, fontes, falta e excesso.
 */

const B = require('../../services/bodyService')

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
    name: 'nutrientesodio',
    aliases: ["fontesodio"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Sódio: para que serve, fontes, falta e excesso',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const n = B.NUTRIENTES['sodio']
    let doc = cab("SÓDIO", '🥗')
    doc += linha('Tipo', n.tipo)
    doc += linha('Papel', n.papel)
    doc += sep()
    doc += '🍽️ *Onde encontrar*\n' + n.fontes + '\n\n'
    doc += '📉 *Quando falta*\n' + n.falta + '\n\n'
    doc += '📈 *Quando sobra*\n' + n.excesso
    doc += '\n\n🥗 _Todos os nutrientes:_ `' + prefix + 'nutrientes`'
    doc += '\n\n_Informação geral de saúde. Sintoma que preocupa se resolve com consulta, não com busca._'
    return reply(doc)
    }
}
