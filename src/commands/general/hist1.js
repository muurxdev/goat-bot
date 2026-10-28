/**
 * Comando .periodoprecabral — ANTES DE 1500
 *
 * Período histórico: Antes de 1500.
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
    name: 'periodoprecabral',
    aliases: ["eraprecabral"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Período histórico: Antes de 1500',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = B.PERIODOS['precabral']
    const eventos = B.eventosDe('precabral')
    let doc = cab("ANTES DE 1500", '📜')
    doc += linha('Quando', (p.inicio < 0 ? 'antes de 1500' : p.inicio) + ' — ' + (p.fim === null ? 'hoje' : p.fim))
    doc += linha('Marca', p.marco)
    doc += sep()
    doc += '📖 *Em resumo*\n' + p.resumo + '\n\n'
    doc += '📅 *O que aconteceu*\n' + p.aconteceu + '\n\n'
    doc += '⚠️ *O que a memória popular erra*\n' + p.engano + '\n'
    if (eventos.length) {
        doc += '\n' + bloco('🔎 EVENTOS COM FICHA', eventos.map(e => e.ano + ' — ' + e.nome + ' `' + prefix + 'evento' + e.chave + '`'))
    }
    doc += '\n📜 _Todos os períodos:_ `' + prefix + 'historiabrasil`'
    return reply(doc)
    }
}
