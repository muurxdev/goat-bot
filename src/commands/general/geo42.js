/**
 * Comando .rankingestados — RANKING DOS ESTADOS
 *
 * Estados ordenados por população ou por área.
 */

const G = require('../../services/brazilGeoService')

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
    name: 'rankingestados',
    aliases: ["maioresestados"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Estados ordenados por população ou por área',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const criterio = String(args[0] || 'populacao').toLowerCase()
    const inverso = /menor|cresc|asc/i.test(args.join(' '))
    const r = G.ranking(criterio, inverso ? 'asc' : 'desc')
    const rotulo = r.campo === 'area' ? 'ÁREA' : 'POPULAÇÃO'
    let doc = cab('RANKING POR ' + rotulo, '🏆')
    doc += linha('Ordem', inverso ? 'do menor para o maior' : 'do maior para o menor')
    doc += sep()
    r.lista.forEach((e, i) => {
        const valor = r.campo === 'area' ? G.num(e.area) + ' km²' : G.num(e.populacao)
        const pct = (e[r.campo] / r.total) * 100
        doc += '┃ *' + String(i + 1).padStart(2) + '.* ' + e.sigla + ' — ' + valor + '  _(' + G.num(pct, 1) + '%)_\n'
    })
    doc += '\n💡 _O outro critério:_ `' + prefix + 'rankingestados ' + (r.campo === 'area' ? 'populacao' : 'area') + '`\n'
    doc += '_' + G.VIGENCIA_DADOS + '._'
    return reply(doc)
    }
}
