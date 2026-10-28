/**
 * Comando .compararpaises — COMPARAR PAÍSES
 *
 * Coloca dois países lado a lado.
 */

const K = require('../../services/knowledgeService')

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

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }

module.exports = {
    name: 'compararpaises',
    aliases: ["versuspais"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Coloca dois países lado a lado',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    if (args.length < 2) return reply('⚖️ 📌 Uso: `' + prefix + 'compararpaises brasil japao`')
    const a = K.PAISES[String(args[0]).toLowerCase()], b = K.PAISES[String(args[1]).toLowerCase()]
    if (!a || !b) return reply('❌ Um dos países não está no catálogo. Veja `' + prefix + 'paises`.')
    let doc = cab('COMPARAR PAÍSES', '⚖️')
    for (const p of [a, b]) {
        doc += '┃ *' + p.nome + '*\n'
        doc += '┃    ' + p.capital + ' · ' + p.continente + '\n'
        doc += '┃    ' + num(p.area) + ' km² · ~' + num(p.pop) + ' mi\n\n'
    }
    doc += sep()
    doc += linha('Maior área', (a.area >= b.area ? a : b).nome)
    doc += linha('Mais populoso', (a.pop >= b.pop ? a : b).nome)
    const densA = a.pop * 1e6 / a.area, densB = b.pop * 1e6 / b.area
    doc += linha('Mais densamente povoado', (densA >= densB ? a : b).nome)
    return reply(doc)
    }
}
