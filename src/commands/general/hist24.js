/**
 * Comando .eventogolpe64 — GOLPE DE 1964
 *
 * Golpe de 1964 (1964) — o que foi e o que se erra sobre isso.
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
    name: 'eventogolpe64',
    aliases: ["fatogolpe64"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Golpe de 1964 (1964) — o que foi e o que se erra sobre isso',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = B.EVENTOS['golpe64']
    const p = B.PERIODOS[e.periodo]
    let doc = cab("GOLPE DE 1964", '📅')
    doc += linha('Ano', String(e.ano))
    doc += linha('Período', p.nome)
    doc += sep()
    doc += '📖 *O que foi*\n' + e.oquefoi + '\n\n'
    doc += '🎯 *Por que importa*\n' + e.importa + '\n\n'
    doc += '⚠️ *O que se costuma errar*\n' + e.engano + '\n\n'
    doc += '📜 _O período inteiro:_ `' + prefix + 'periodo' + e.periodo + '`\n'
    doc += '🕰️ _Linha do tempo:_ `' + prefix + 'linhadotempo`'
    return reply(doc)
    }
}
