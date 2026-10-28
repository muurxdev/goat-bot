/**
 * Comando .compararestados — COMPARAR ESTADOS
 *
 * Põe dois estados lado a lado com área, população e densidade.
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
    name: 'compararestados',
    aliases: ["duelodeestados"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Põe dois estados lado a lado com área, população e densidade',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = args.length >= 2 ? G.comparar(args[0], args.slice(1).join(' ')) : null
    if (!c) {
        let doc = cab('COMPARAR ESTADOS', '⚖️')
        doc += '📌 Uso: `' + prefix + 'compararestados <um> <outro>`\n\n'
        doc += '🧮 *Exemplos*\n`' + prefix + 'compararestados SP RR`\n`' + prefix + 'compararestados bahia amazonas`'
        return reply(doc)
    }
    let doc = cab('COMPARAR ESTADOS', '⚖️')
    for (const [e, d] of [[c.a, c.densidadeA], [c.b, c.densidadeB]]) {
        doc += bloco(e.sigla + ' — ' + e.nome.toUpperCase(), [
            'Capital: ' + e.capital,
            'Área: ' + G.num(e.area) + ' km²',
            'População: ' + G.num(e.populacao),
            'Densidade: ' + G.num(d, 1) + ' hab/km²'
        ])
    }
    doc += '\n📐 *O veredito*\n'
    doc += '┃ Maior em área: *' + c.maiorArea.sigla + '* (' + G.num(c.razaoArea, 1) + '× o outro)\n'
    doc += '┃ Mais populoso: *' + c.maisPopuloso.sigla + '* (' + G.num(c.razaoPop, 1) + '× o outro)\n'
    const maisDenso = c.densidadeA >= c.densidadeB ? c.a : c.b
    doc += '┃ Mais denso: *' + maisDenso.sigla + '*\n\n'
    doc += '_' + G.VIGENCIA_DADOS + '._'
    return reply(doc)
    }
}
