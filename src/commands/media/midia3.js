/**
 * Comando .formatosvideo — FORMATOS DE VÍDEO
 *
 * Qual formato de vídeo escolher e por quê.
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
    name: 'formatosvideo',
    aliases: ["videoformatos"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Qual formato de vídeo escolher e por quê',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Formatos de vídeo', '🎬')
    for (const [f, d] of M.FORMATOS.video) doc += '• *' + f + '* — ' + d + '\n'
    doc += '\n💡 _Na dúvida, use mp4._'
    return reply(doc)
    }
}
