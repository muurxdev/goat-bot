/**
 * Comando .constelacaoescorpiao — ESCORPIÃO
 *
 * Constelação Escorpião (Scorpius): como achar no céu.
 */

const A = require('../../services/astronomyService')

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
    name: 'constelacaoescorpiao',
    aliases: ["estrelasescorpiao"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Constelação Escorpião (Scorpius): como achar no céu',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const k = A.CONSTELACOES['escorpiao']
    let doc = cab("ESCORPIÃO", '✨')
    doc += linha('Nome latino', k.latim)
    doc += linha('Hemisfério', k.hemisferio)
    doc += linha('Estrelas principais', String(k.estrelas))
    doc += linha('Melhor época', k.melhorepoca)
    doc += sep()
    doc += '🔭 *Como achar*\n' + k.como + '\n\n'
    doc += '📜 *Vale saber*\n' + k.historia
    doc += '\n\n✨ _Mapa completo:_ `' + prefix + 'constelacoes`'
    return reply(doc)
    }
}
