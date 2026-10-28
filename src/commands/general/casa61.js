/**
 * Comando .racascaes — RAÇAS DE CÃES
 *
 * Todas as raças por porte e nível de energia.
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
    name: 'racascaes',
    aliases: ["listacaes"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Todas as raças por porte e nível de energia',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const entradas = Object.entries(H.CAES).filter(([, c]) => !filtro || c.porte.includes(filtro) || c.energia.includes(filtro))
    if (!entradas.length) return reply('🐕 Nada com `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'racascaes`')
    let doc = cab('RAÇAS DE CÃES', '🐕')
    doc += linha('Raças', String(entradas.length)) + '\n'
    for (const [k, c] of entradas) {
        doc += '┃ *' + c.nome + '*\n┃    porte ' + c.porte + ' · energia ' + c.energia + '\n┃    `' + prefix + 'cao' + k + '`\n'
    }
    doc += '\n💡 _Filtrar:_ `' + prefix + 'racascaes pequeno` ou `' + prefix + 'racascaes alta`\n'
    doc += '🐈 _Gatos:_ `' + prefix + 'racasgatos`'
    return reply(doc)
    }
}
