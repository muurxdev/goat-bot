/**
 * Comando .brasilnumeros — O BRASIL EM NÚMEROS
 *
 * Totais, extremos e concentração do país.
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
    name: 'brasilnumeros',
    aliases: ["paisemnumeros"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Totais, extremos e concentração do país',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const estados = Object.entries(G.ESTADOS).map(([s, e]) => ({ sigla: s.toUpperCase(), ...e }))
    const area = estados.reduce((s, e) => s + e.area, 0)
    const pop = estados.reduce((s, e) => s + e.populacao, 0)
    const porArea = [...estados].sort((a, b) => b.area - a.area)
    const porPop = [...estados].sort((a, b) => b.populacao - a.populacao)
    const densos = [...estados].sort((a, b) => (b.populacao / b.area) - (a.populacao / a.area))
    let doc = cab('O BRASIL EM NÚMEROS', '📊')
    doc += linha('Unidades federativas', '27 (26 estados + DF)')
    doc += linha('Área total', G.num(area) + ' km²')
    doc += linha('População', G.num(pop))
    doc += linha('Densidade média', G.num(pop / area, 1) + ' hab/km²')
    doc += sep()
    doc += bloco('🏆 EXTREMOS', [
        'Maior em área: ' + porArea[0].sigla + ' (' + G.num(porArea[0].area) + ' km²)',
        'Menor em área: ' + porArea[porArea.length - 1].sigla + ' (' + G.num(porArea[porArea.length - 1].area) + ' km²)',
        'Mais populoso: ' + porPop[0].sigla + ' (' + G.num(porPop[0].populacao) + ')',
        'Menos populoso: ' + porPop[porPop.length - 1].sigla + ' (' + G.num(porPop[porPop.length - 1].populacao) + ')',
        'Mais denso: ' + densos[0].sigla + ' (' + G.num(densos[0].populacao / densos[0].area, 1) + ' hab/km²)',
        'Menos denso: ' + densos[densos.length - 1].sigla + ' (' + G.num(densos[densos.length - 1].populacao / densos[densos.length - 1].area, 1) + ' hab/km²)'
    ])
    const tresMaiores = porPop.slice(0, 3)
    const pctTres = tresMaiores.reduce((s, e) => s + e.populacao, 0) / pop * 100
    doc += '\n🔎 *A concentração*\n' + tresMaiores.map(e => e.sigla).join(', ') + ' somam ' + G.num(pctTres, 1) + '% da população do país.\n'
    doc += 'O maior estado em área, ' + porArea[0].sigla + ', cabe ' + G.num(porArea[0].area / porArea[porArea.length - 1].area, 0) + ' vezes o menor.\n\n'
    doc += '_' + G.VIGENCIA_DADOS + '._'
    return reply(doc)
    }
}
