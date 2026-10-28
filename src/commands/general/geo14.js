/**
 * Comando .estadopa — PARÁ
 *
 * Estado do Brasil: Pará (PA).
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
    name: 'estadopa',
    aliases: ["para","ufpa"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Estado do Brasil: Pará (PA)',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const e = G.ESTADOS['pa']
    const dens = e.populacao / e.area
    let doc = cab("PARÁ (PA)", '🗺️')
    doc += linha('Capital', e.capital)
    doc += linha('Região', e.regiao)
    doc += linha('Quem nasce lá', e.gentilico)
    doc += linha('Área', G.num(e.area) + ' km²')
    doc += linha('População', G.num(e.populacao))
    doc += linha('Densidade', G.num(dens, 1) + ' hab/km²')
    doc += linha('Bioma', e.bioma)
    doc += sep()
    doc += '🔎 *O que distingue*\n' + e.marca + '\n\n'
    doc += '_' + G.VIGENCIA_DADOS + '._\n'
    doc += '🗺️ _Todos os estados:_ `' + prefix + 'estadosbrasil`   📍 _A região:_ `' + prefix + 'regiaonorte`'
    return reply(doc)
    }
}
