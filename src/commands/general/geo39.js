/**
 * Comando .estadosbrasil — ESTADOS DO BRASIL
 *
 * Os 27 estados agrupados por região.
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
    name: 'estadosbrasil',
    aliases: ["ufs","estados"],
    category: 'general',
    subcategory: 'Geografia do Brasil',
    description: 'Os 27 estados agrupados por região',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('ESTADOS DO BRASIL', '🗺️')
    doc += linha('Unidades federativas', String(Object.keys(G.ESTADOS).length))
    doc += linha('Regiões', String(Object.keys(G.REGIOES).length)) + '\n'
    for (const chave of Object.keys(G.REGIOES)) {
        const d = G.estadosDa(chave)
        doc += bloco(d.regiao.nome.toUpperCase(), d.estados.map(e => e.sigla + ' — ' + e.nome + ' · ' + e.capital + ' `' + prefix + 'estado' + e.sigla.toLowerCase() + '`'))
    }
    doc += '\n🏆 _Ranking:_ `' + prefix + 'rankingestados populacao`   🌳 _Biomas:_ `' + prefix + 'biomasbrasil`\n'
    doc += '_' + G.VIGENCIA_DADOS + '._'
    return reply(doc)
    }
}
