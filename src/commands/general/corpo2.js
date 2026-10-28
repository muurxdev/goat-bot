/**
 * Comando .sistemalinfatico — SISTEMA LINFÁTICO
 *
 * Sistema linfático: órgãos, função e sinais de alerta.
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
    name: 'sistemalinfatico',
    aliases: ["corpolinfatico"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Sistema linfático: órgãos, função e sinais de alerta',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const s = B.SISTEMAS['linfatico']
    let doc = cab("SISTEMA LINFÁTICO", '🫀')
    doc += linha('Órgãos', s.orgaos)
    doc += sep()
    doc += '⚙️ *O que faz*\n' + s.funcao + '\n\n'
    doc += '📐 *O número que dá a escala*\n' + s.numero + '\n\n'
    doc += '🚩 *Sinal de alerta*\n' + s.sinal + '\n\n'
    doc += '🫀 _Todos os sistemas:_ `' + prefix + 'corpohumano`'
    doc += '\n\n_Informação geral de saúde. Sintoma que preocupa se resolve com consulta, não com busca._'
    return reply(doc)
    }
}
