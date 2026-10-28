/**
 * Comando .pesoaudio — PESO DO ÁUDIO
 *
 * Estima o tamanho de um áudio pela duração.
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
    name: 'pesoaudio',
    aliases: ["tamanhoaudio"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Estima o tamanho de um áudio pela duração',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const seg = segundosDe(args[0])
    if (!seg) return reply('⚖️ 📌 Uso: `' + prefix + 'pesoaudio 3:45`\n\n_(duração do áudio)_')
    let doc = cab('Peso do áudio', '⚖️')
    doc += linha('Duração', M.formatarDuracao(seg))
    doc += sep()
    for (const kbps of Object.keys(M.TAXAS_AUDIO)) {
        doc += '• ' + String(kbps + ' kbps').padEnd(10) + M.tamanho(M.pesoEstimado(Number(kbps), seg)) + '\n'
    }
    return reply(doc)
    }
}
