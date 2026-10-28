/**
 * Comando .midiasites — SITES SUPORTADOS
 *
 * De onde o bot consegue baixar.
 */

const M = require('../../services/mediaInfoService')

function cab(titulo, emoji) {
    return emoji + ' *' + titulo + '*\n\n'
}
function linha(rotulo, valor) { return '*' + rotulo + ':* ' + valor + '\n' }
function sep() { return '\n' }
function bloco(titulo, itens) {
    let t = '*' + titulo + '*\n'
    for (const i of itens) t += '• ' + i + '\n'
    return t
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function segundosDe(txt) {
    const s = M.lerDuracao(txt)
    return s && s > 0 ? s : null
}

module.exports = {
    name: 'midiasites',
    aliases: ["sitessuportados"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'De onde eu consigo baixar',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const sites = M.sitesSuportados()
    let doc = cab('Sites suportados', '🌐')
    if (!sites.length) return reply(doc + '_Nenhum provedor encontrado._')
    for (const s of sites) doc += '• 🟢 ' + s + '\n'
    doc += '\n_Outros endereços passam pelo tratamento genérico e podem funcionar._'
    return reply(doc)
    }
}
