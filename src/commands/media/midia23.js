/**
 * Comando .audio64 — ÁUDIO 64 KBPS
 *
 * Detalhes da qualidade de áudio 64 kbps.
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
    name: 'audio64',
    aliases: ["qualidade64"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Detalhes da qualidade de áudio 64 kbps',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Áudio 64 kbps', '🎧')
    doc += linha('Nível', 'Rádio AM')
    doc += linha('Indicado para', 'voz, podcast simples')
    doc += sep()
    for (const min of [1, 3, 5, 10, 60]) {
        doc += '• ' + String(min + ' min').padEnd(8) + M.tamanho(M.pesoEstimado(64, min * 60)) + '\n'
    }
    return reply(doc)
    }
}
