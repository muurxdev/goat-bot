/**
 * Comando .problemarescisaoindireta — RESCISÃO INDIRETA
 *
 * O que fazer quando: rescisão indireta.
 */

const L = require('../../services/laborService')

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
    name: 'problemarescisaoindireta',
    aliases: ["oqfazerrescisaoindireta"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'O que fazer quando: rescisão indireta',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const s = L.SITUACOES['rescisaoindireta']
    let doc = cab("RESCISÃO INDIRETA", '🆘')
    doc += linha('Urgência', s.urgencia)
    doc += sep()
    doc += '📖 *O que a lei diz*\n' + s.oquediz + '\n\n'
    doc += '╭━〔 ✅ O QUE FAZER 〕━⬣\n'
    s.oquefazer.forEach((p, i) => { doc += '┃ *' + (i + 1) + '.* ' + p + '\n' })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '📍 *Onde procurar*\n' + s.onde + '\n\n'
    doc += '_Orientação geral. Caso concreto pede advogado ou sindicato._'
    return reply(doc)
    }
}
