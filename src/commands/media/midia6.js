/**
 * Comando .qualidadesvideo — QUALIDADES DE VÍDEO
 *
 * O que muda entre 480p e 4K.
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
    name: 'qualidadesvideo',
    aliases: ["taxasvideo"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'O que muda entre 480p e 4K',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Qualidades de vídeo', '📺')
    for (const [res, info] of Object.entries(M.TAXAS_VIDEO)) {
        const peso = M.pesoEstimado(info.kbps, 300)
        doc += '• *' + res + '* — ' + info.nome + '\n'
        doc += '   ' + info.uso + ' · ~' + M.tamanho(peso) + ' por 5 min\n'
    }
    return reply(doc)
    }
}
