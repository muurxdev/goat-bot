/**
 * Comando .video2160p — VÍDEO 2160p
 *
 * Detalhes da qualidade de vídeo 2160p.
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
    name: 'video2160p',
    aliases: ["resolucao2160p"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Detalhes da qualidade de vídeo 2160p',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Vídeo 2160p', '🎥')
    doc += linha('Nível', '4K')
    doc += linha('Indicado para', 'televisão grande')
    doc += linha('Taxa típica', '25000 kbps')
    doc += sep()
    for (const min of [1, 5, 10, 30, 60]) {
        doc += '• ' + String(min + ' min').padEnd(8) + M.tamanho(M.pesoEstimado(25000, min * 60)) + '\n'
    }
    return reply(doc)
    }
}
