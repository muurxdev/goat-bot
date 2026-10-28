/**
 * Comando .converterduracao — CONVERTER DURAÇÃO
 *
 * Passa entre segundos e formato de tempo.
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
    name: 'converterduracao',
    aliases: ["duracaoparasegundos"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Passa entre segundos e formato de tempo',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const t = String(args[0] || '').trim()
    if (!t) return reply('⏱️ 📌 Uso: `' + prefix + 'converterduracao 3:45` ou `' + prefix + 'converterduracao 225`')
    const seg = M.lerDuracao(t)
    if (seg === null) return reply('❌ Não entendi essa duração. Use 3:45, 1:02:30 ou só os segundos.')
    let doc = cab('Converter duração', '⏱️')
    doc += linha('Entrada', t)
    doc += linha('Segundos', String(seg))
    doc += linha('Formatado', M.formatarDuracao(seg))
    doc += linha('Minutos', (seg / 60).toFixed(2))
    doc += linha('Horas', (seg / 3600).toFixed(3))
    return reply(doc)
    }
}
