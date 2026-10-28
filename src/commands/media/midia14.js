/**
 * Comando .calcularproporcao2 — PROPORÇÃO DA TELA
 *
 * Descobre a proporção de uma resolução.
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
    name: 'calcularproporcao2',
    aliases: ["proporcaotela"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Descobre a proporção de uma resolução',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const l = parseInt(args[0], 10), a = parseInt(args[1], 10)
    if (!l || !a) return reply('📐 📌 Uso: `' + prefix + 'calcularproporcao2 1920 1080`')
    const p = M.proporcao(l, a)
    let doc = cab('Proporção da tela', '📐')
    doc += linha('Resolução', l + '×' + a)
    doc += linha('Proporção', p.texto)
    doc += linha('Orientação', p.orientacao)
    const conhecida = M.PROPORCOES[p.texto]
    if (conhecida) doc += linha('Uso comum', conhecida)
    return reply(doc)
    }
}
