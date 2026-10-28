/**
 * Comando .formatosimagem — FORMATOS DE IMAGEM
 *
 * Qual formato de imagem escolher e por quê.
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
    name: 'formatosimagem',
    aliases: ["imagemformatos"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Qual formato de imagem escolher e por quê',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Formatos de imagem', '🖼️')
    for (const [f, d] of M.FORMATOS.imagem) doc += '• *' + f + '* — ' + d + '\n'
    doc += '\n💡 _Figurinha do WhatsApp é sempre webp._'
    return reply(doc)
    }
}
