/**
 * Comando .midiadicas — DICAS DE MÍDIA
 *
 * Como conseguir o melhor resultado nos downloads.
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
    name: 'midiadicas',
    aliases: ["dicasmidia"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Como conseguir o melhor resultado nos downloads',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('Dicas de mídia', '💡')
    doc += bloco('Áudio', [
        '128 kbps já é suficiente para ouvir no celular',
        '320 kbps só faz diferença com fone bom',
        'Áudio de voz cabe bem em 64 kbps'
    ])
    doc += '\n' + bloco('Vídeo', [
        '720p é o melhor equilíbrio entre peso e qualidade',
        '1080p dobra o tamanho e nem sempre se nota no celular',
        'Vídeo vertical: prefira 9:16 para não aparecer tarja'
    ])
    doc += '\n' + bloco('Envio', [
        'Link completo funciona melhor que encurtado',
        'Arquivo grande demora — confira `' + prefix + 'cabeenvio`'
    ])
    return reply(doc)
    }
}
