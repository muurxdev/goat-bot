/**
 * Comando .proporcoes — PROPORÇÕES COMUNS
 *
 * As proporções de tela mais usadas.
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
    name: 'proporcoes',
    aliases: ["listaproporcoes"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'As proporções de tela mais usadas',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Proporções comuns', '🖥️')
    for (const [p, uso] of Object.entries(M.PROPORCOES)) doc += '• *' + p + '* — ' + uso + '\n'
    return reply(doc)
    }
}
