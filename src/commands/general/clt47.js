/**
 * Comando .direitostrabalhistas — DIREITOS TRABALHISTAS
 *
 * Todos os direitos da CLT com base legal.
 */

const L = require('../../services/laborService')

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
    name: 'direitostrabalhistas',
    aliases: ["seusdireitos","clt"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Todos os direitos da CLT com base legal',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('DIREITOS TRABALHISTAS', '⚖️')
    doc += linha('Fichas', String(Object.keys(L.DIREITOS).length)) + '\n'
    for (const [k, d] of Object.entries(L.DIREITOS)) {
        doc += '┃ *' + d.nome + '*\n┃    ' + d.base + '\n┃    `' + prefix + 'direito' + k + '`\n'
    }
    doc += '\n📄 _Contratos:_ `' + prefix + 'tiposcontrato`   🆘 _Problemas:_ `' + prefix + 'problemastrabalho`\n'
    doc += '🧮 _Calculadoras:_ `' + prefix + 'calculadorasclt`'
    return reply(doc)
    }
}
