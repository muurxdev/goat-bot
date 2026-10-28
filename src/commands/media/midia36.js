/**
 * Comando .midiatabelavideo — TABELA DE VÍDEO
 *
 * Peso do vídeo por resolução e duração.
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
    name: 'midiatabelavideo',
    aliases: ["tabelavideo"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Peso do vídeo por resolução e duração',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Tabela de vídeo', '📈')
    for (const [res, info] of Object.entries(M.TAXAS_VIDEO)) {
        doc += '• ' + res.padEnd(7)
        for (const min of [1, 10, 60]) doc += M.tamanho(M.pesoEstimado(info.kbps, min * 60)).padEnd(10)
        doc += '\n'
    }
    doc += '\n_Colunas: 1 min · 10 min · 1 hora._'
    return reply(doc)
    }
}
