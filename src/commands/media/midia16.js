/**
 * Comando .calcularescala — REDIMENSIONAR
 *
 * Calcula a altura mantendo a proporção.
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
    name: 'calcularescala',
    aliases: ["novaresolucao"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Calcula a altura mantendo a proporção',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const l = parseInt(args[0], 10), a = parseInt(args[1], 10), n = parseInt(args[2], 10)
    if (!l || !a || !n) return reply('📏 📌 Uso: `' + prefix + 'calcularescala 1920 1080 720`\n\n_(largura, altura, nova largura)_')
    const r = M.redimensionar(l, a, n)
    let doc = cab('Redimensionar', '📏')
    doc += linha('Original', l + '×' + a)
    doc += linha('Nova', r.largura + '×' + r.altura)
    doc += linha('Proporção mantida', M.proporcao(l, a).texto)
    doc += linha('Redução', ((1 - (r.largura * r.altura) / (l * a)) * 100).toFixed(0) + '% de área')
    return reply(doc)
    }
}
