/**
 * Comando .queanofoi — O QUE ACONTECEU NESSE ANO
 *
 * Diz o período e os eventos de um ano.
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
    name: 'queanofoi',
    aliases: ["oqueaconteceuem"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Diz o período e os eventos de um ano',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const ano = parseInt(args[0], 10)
    if (!Number.isFinite(ano)) {
        let doc = cab('O QUE ACONTECEU NESSE ANO', '🔍')
        doc += '📌 Uso: `' + prefix + 'queanofoi 1888`\n\n'
        doc += '_Diz em que período o ano cai e quais eventos com ficha aconteceram nele ou perto dele._'
        return reply(doc)
    }
    const p = B.periodoDoAno(ano)
    if (!p) return reply('🔍 O ano ' + ano + ' está fora do que o catálogo cobre.\n\n📜 _Veja os períodos:_ `' + prefix + 'historiabrasil`')
    const exatos = B.linhaDoTempo().filter(e => e.ano === ano)
    const perto = B.linhaDoTempo().filter(e => Math.abs(e.ano - ano) <= 15 && e.ano !== ano).slice(0, 5)
    let doc = cab('BRASIL EM ' + ano, '🔍')
    doc += linha('Período', p.nome)
    doc += linha('Marca do período', p.marco)
    doc += sep()
    if (exatos.length) {
        doc += bloco('📅 NESSE ANO', exatos.map(e => e.nome + ' `' + prefix + 'evento' + e.chave + '`'))
    } else {
        doc += '_Nenhum evento com ficha exatamente em ' + ano + '._\n'
    }
    if (perto.length) {
        doc += bloco('🕰️ POR PERTO', perto.map(e => e.ano + ' — ' + e.nome + ' `' + prefix + 'evento' + e.chave + '`'))
    }
    doc += '\n📜 _O período inteiro:_ `' + prefix + 'periodo' + p.chave + '`'
    return reply(doc)
    }
}
