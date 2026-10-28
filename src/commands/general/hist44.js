/**
 * Comando .historiabrasil — HISTÓRIA DO BRASIL
 *
 * Os períodos da história do Brasil, do início a hoje.
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
    name: 'historiabrasil',
    aliases: ["historia","periodos"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Os períodos da história do Brasil, do início a hoje',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('HISTÓRIA DO BRASIL', '📜')
    doc += linha('Períodos', String(Object.keys(B.PERIODOS).length))
    doc += linha('Eventos com ficha', String(Object.keys(B.EVENTOS).length))
    doc += linha('Figuras', String(Object.keys(B.FIGURAS).length))
    doc += sep()
    for (const [k, p] of Object.entries(B.PERIODOS)) {
        const faixa = (p.inicio < 0 ? 'até' : p.inicio) + (p.fim === null ? ' — hoje' : ' — ' + p.fim)
        doc += '┃ *' + p.nome + '* (' + faixa + ')\n'
        doc += '┃    ' + p.marco + '\n'
        doc += '┃    `' + prefix + 'periodo' + k + '`\n'
    }
    doc += '\n🕰️ _Linha do tempo:_ `' + prefix + 'linhadotempo`   👥 _Figuras:_ `' + prefix + 'figurashistoria`\n'
    doc += '🏛️ _Presidentes desde 1985:_ `' + prefix + 'presidentesbrasil`'
    return reply(doc)
    }
}
