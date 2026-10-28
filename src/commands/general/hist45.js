/**
 * Comando .linhadotempo — LINHA DO TEMPO
 *
 * Todos os eventos em ordem cronológica.
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
    name: 'linhadotempo',
    aliases: ["timeline","cronologia"],
    category: 'general',
    subcategory: 'História do Brasil',
    description: 'Todos os eventos em ordem cronológica',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const de = parseInt(args[0], 10)
    const ate = parseInt(args[1], 10)
    let lista = B.linhaDoTempo()
    if (Number.isFinite(de)) lista = lista.filter(e => e.ano >= de && (!Number.isFinite(ate) || e.ano <= ate))
    if (!lista.length) return reply('🕰️ Nenhum evento nesse recorte.\n\n📌 Veja tudo: `' + prefix + 'linhadotempo`')
    let doc = cab('LINHA DO TEMPO', '🕰️')
    doc += linha('Eventos', String(lista.length))
    if (Number.isFinite(de)) doc += linha('Recorte', de + (Number.isFinite(ate) ? ' a ' + ate : ' em diante'))
    doc += sep()
    let periodoAtual = null
    for (const e of lista) {
        if (e.periodo !== periodoAtual) {
            periodoAtual = e.periodo
            doc += '\n*' + B.PERIODOS[e.periodo].nome + '*\n'
        }
        doc += '┃ *' + e.ano + '* — ' + e.nome + '\n┃    `' + prefix + 'evento' + e.chave + '`\n'
    }
    doc += '\n💡 _Recortar:_ `' + prefix + 'linhadotempo 1888 1930`'
    return reply(doc)
    }
}
