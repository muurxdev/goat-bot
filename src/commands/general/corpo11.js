/**
 * Comando .orgaopancreas — PÂNCREAS
 *
 * Pâncreas: função, curiosidade e cuidado.
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
    name: 'orgaopancreas',
    aliases: ["sobreopancreas"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Pâncreas: função, curiosidade e cuidado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const o = B.ORGAOS['pancreas']
    let doc = cab("PÂNCREAS", '🧬')
    doc += linha('Sistema', o.sistema)
    if (o.peso !== '—') doc += linha('Peso', o.peso)
    doc += sep()
    doc += '⚙️ *O que faz*\n' + o.funcao + '\n\n'
    doc += '🔎 *Curiosidade*\n' + o.curiosidade + '\n\n'
    doc += '🛡️ *Como cuidar*\n' + o.cuidado
    doc += '\n\n🧬 _Todos os órgãos:_ `' + prefix + 'orgaos`'
    doc += '\n\n_Informação geral de saúde. Sintoma que preocupa se resolve com consulta, não com busca._'
    return reply(doc)
    }
}
