/**
 * Comando .regiaocentrooeste — REGIÃO CENTRO-OESTE
 *
 * Região Centro-Oeste: estados, economia e o que a define.
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
    name: 'regiaocentrooeste',
    aliases: [],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Região Centro-Oeste: estados, economia e o que a define',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = G.estadosDa('centrooeste')
    const r = d.regiao
    const area = d.estados.reduce((s, e) => s + e.area, 0)
    const pop = d.estados.reduce((s, e) => s + e.populacao, 0)
    let doc = cab("REGIÃO CENTRO-OESTE", '📍')
    doc += linha('Estados', String(d.estados.length))
    doc += linha('Área', G.num(area) + ' km²')
    doc += linha('População', G.num(pop))
    doc += sep()
    doc += '🎯 *O que define*\n' + r.marca + '\n\n'
    doc += '💼 *Economia*\n' + r.economia + '\n\n'
    doc += '📐 *Vale saber*\n' + r.detalhe + '\n\n'
    doc += bloco('🗺️ ESTADOS', d.estados.map(e => e.sigla + ' — ' + e.nome + ' (' + e.capital + ') `' + prefix + 'estado' + e.sigla.toLowerCase() + '`'))
    doc += '\n_' + G.VIGENCIA_DADOS + '._'
    return reply(doc)
    }
}
