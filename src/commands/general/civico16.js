/**
 * Comando .direitopassagemaerea — VOO ATRASADO OU CANCELADO
 *
 * Direito do consumidor: voo atrasado ou cancelado.
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
    name: 'direitopassagemaerea',
    aliases: ["leipassagemaerea"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Direito do consumidor: voo atrasado ou cancelado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = C.DIREITOS['passagemaerea']
    let doc = cab("VOO ATRASADO OU CANCELADO", '⚖️')
    doc += linha('Prazo', d.prazo)
    doc += linha('Base legal', d.base)
    doc += sep()
    doc += '📖 *O que a lei garante*\n' + d.resumo + '\n\n'
    doc += '🛠️ *Como exercer*\n' + d.comofazer + '\n\n'
    doc += '⚠️ *Onde a maioria escorrega*\n' + d.armadilha + '\n\n'
    doc += '_Resumo informativo. Caso concreto pede orientação jurídica._'
    return reply(doc)
    }
}
