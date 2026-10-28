/**
 * Comando .pesovideo — PESO DO VÍDEO
 *
 * Estima o tamanho de um vídeo pela duração.
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
    name: 'pesovideo',
    aliases: ["tamanhovideo"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Estima o tamanho de um vídeo pela duração',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const seg = segundosDe(args[0])
    if (!seg) return reply('📦 📌 Uso: `' + prefix + 'pesovideo 10:00`')
    const lim = M.limites()
    let doc = cab('Peso do vídeo', '📦')
    doc += linha('Duração', M.formatarDuracao(seg))
    doc += sep()
    for (const [res, info] of Object.entries(M.TAXAS_VIDEO)) {
        const bytes = M.pesoEstimado(info.kbps, seg)
        const cabe = lim.MAX_FILE_SIZE_BYTES ? bytes <= lim.MAX_FILE_SIZE_BYTES : true
        doc += '• ' + res.padEnd(7) + M.tamanho(bytes).padEnd(11) + (cabe ? '🟢' : '🔴') + '\n'
    }
    if (lim.MAX_FILE_SIZE_BYTES) doc += '\n_🔴 passa do limite de ' + M.tamanho(lim.MAX_FILE_SIZE_BYTES) + '._'
    return reply(doc)
    }
}
