/**
 * Comando .resolucoes — RESOLUÇÕES COMUNS
 *
 * Tabela de resoluções e seus nomes.
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
    name: 'resolucoes',
    aliases: ["listaresolucoes"],
    category: 'media',
    subcategory: 'Informação de Mídia',
    description: 'Tabela de resoluções e seus nomes',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = [['426×240', '240p'], ['640×360', '360p'], ['854×480', '480p'], ['1280×720', '720p (HD)'],
        ['1920×1080', '1080p (Full HD)'], ['2560×1440', '1440p (Quad HD)'], ['3840×2160', '2160p (4K)'],
        ['1080×1080', 'Quadrado'], ['1080×1920', 'Vertical (stories)'], ['512×512', 'Figurinha']]
    let doc = cab('Resoluções comuns', '🖼️')
    for (const [r, n] of lista) doc += '• ' + r.padEnd(11) + n + '\n'
    return reply(doc)
    }
}
