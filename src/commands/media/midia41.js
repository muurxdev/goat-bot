/**
 * Comando .kbparamb — KB PARA MB
 *
 * Converte de KB para MB.
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
    name: 'kbparamb',
    aliases: ["kiloparamega"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Converte de KB para MB',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const v = parseFloat(String(args[0] || '').replace(',', '.'))
    if (isNaN(v)) return reply('🔄 📌 Uso: `' + prefix + 'kbparamb 500`')
    let doc = cab('KB para MB', '🔄')
    doc += linha('Entrada', v.toLocaleString('pt-BR') + ' KB')
    doc += linha('Resultado', (v * 0.0009765625).toLocaleString('pt-BR', { maximumFractionDigits: 4 }) + ' MB')
    return reply(doc)
    }
}
