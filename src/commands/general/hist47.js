/**
 * Comando .presidentesbrasil — PRESIDENTES DESDE 1985
 *
 * Os presidentes da Nova República e o marco de cada governo.
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
    name: 'presidentesbrasil',
    aliases: ["presidentes"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Os presidentes da Nova República e o marco de cada governo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('PRESIDENTES DESDE 1985', '🏛️')
    doc += linha('Governos', String(B.PRESIDENTES.length)) + '\n'
    for (const p of B.PRESIDENTES) {
        doc += '┃ *' + p.nome + '* (' + p.periodo + ')\n'
        doc += '┃    _' + p.comochegou + '_\n'
        doc += '┃    ' + p.marco + '\n'
    }
    doc += '\n🔎 *Um padrão que salta aos olhos*\nTrês dos nove chegaram ao cargo como vice: Sarney pela morte de Tancredo, Itamar e Temer por impeachment.\n\n'
    doc += '📜 _O período:_ `' + prefix + 'periodonovarepublica`'
    return reply(doc)
    }
}
