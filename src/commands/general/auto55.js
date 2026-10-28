/**
 * Comando .emergenciamultaindevida — MULTA QUE VOCÊ ACHA INDEVIDA
 *
 * Na estrada: multa que você acha indevida.
 */

const A = require('../../services/autoService')

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
    name: 'emergenciamultaindevida',
    aliases: ["naestradamultaindevida"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Na estrada: multa que você acha indevida',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = A.EMERGENCIAS['multaindevida']
    let doc = cab("MULTA QUE VOCÊ ACHA INDEVIDA", '🆘')
    doc += linha('Prioridade', e.prioridade)
    doc += sep()
    doc += '╭━〔 ✅ PASSO A PASSO 〕━⬣\n'
    e.passos.forEach((p, i) => { doc += '┃ *' + (i + 1) + '.* ' + p + '\n' })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '🚫 *O erro que mais aparece*\n' + e.erro + '\n\n'
    doc += '☎️ _190 polícia · 192 SAMU · 193 bombeiros · 191 rodovia federal_'
    return reply(doc)
    }
}
