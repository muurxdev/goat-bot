/**
 * Comando .racasgatos — RAÇAS DE GATOS
 *
 * Todas as raças de gato com temperamento e cuidados.
 */

const H = require('../../services/homeLifeService')

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
    name: 'racasgatos',
    aliases: ["listagatos"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Todas as raças de gato com temperamento e cuidados',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('RAÇAS DE GATOS', '🐈')
    doc += linha('Raças', String(Object.keys(H.GATOS).length)) + '\n'
    for (const [k, g] of Object.entries(H.GATOS)) {
        doc += '┃ *' + g.nome + '*\n┃    pelo ' + g.pelo + ' · energia ' + g.energia + '\n┃    `' + prefix + 'gato' + k + '`\n'
    }
    doc += '\n🐕 _Cães:_ `' + prefix + 'racascaes`'
    return reply(doc)
    }
}
