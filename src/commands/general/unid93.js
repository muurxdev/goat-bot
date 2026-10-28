/**
 * Comando .unidadesajuda — GUIA DAS UNIDADES
 *
 * Como usar o sistema de conversão.
 */

const U = require('../../services/unitsService')

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
    name: 'unidadesajuda',
    aliases: ["guiaunidades"],
    category: 'general',
    subcategory: 'Unidades',
    description: 'Como usar o sistema de conversão',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('GUIA DAS UNIDADES', '🗺️')
    doc += '🔄 *Converter qualquer coisa*\n`' + prefix + 'converterqualquer 10 km milha`\n\n'
    doc += '📐 *Ver equivalências de uma unidade*\n`' + prefix + 'unidadekm` — quanto 1 km dá em tudo\n\n'
    doc += '📚 *Ver as unidades de uma categoria*\n`' + prefix + 'tabelamassa`\n\n'
    doc += '🔎 *Não sabe o que é a sigla?*\n`' + prefix + 'qualunidade psi`\n\n'
    doc += '_Conversão entre categorias é recusada de propósito: quilo não vira metro._'
    return reply(doc)
    }
}
