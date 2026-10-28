/**
 * Comando .midialimites — LIMITES DO BOT
 *
 * Tamanho e duração máximos aceitos.
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
    name: 'midialimites',
    aliases: ["limitesmidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Tamanho e duração máximos aceitos',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const l = M.limites()
    let doc = cab('Meus limites', '🚧')
    if (l.MAX_FILE_SIZE_BYTES) doc += linha('Arquivo', M.tamanho(l.MAX_FILE_SIZE_BYTES))
    if (l.MAX_DRIVE_FILE_SIZE_BYTES) doc += linha('Envio grande', M.tamanho(l.MAX_DRIVE_FILE_SIZE_BYTES))
    if (l.MAX_DURATION_SECONDS) doc += linha('Duração', M.formatarDuracao(l.MAX_DURATION_SECONDS))
    if (l.MAX_GALLERY_ITEMS) doc += linha('Itens por galeria', String(l.MAX_GALLERY_ITEMS))
    if (l.SEARCH_LIMIT) doc += linha('Resultados de busca', String(l.SEARCH_LIMIT))
    if (!Object.keys(l).length) doc += '_Limites não configurados._'
    return reply(doc)
    }
}
