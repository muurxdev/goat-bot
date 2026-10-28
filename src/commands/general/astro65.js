/**
 * Comando .constelacoes — CONSTELAÇÕES
 *
 * Constelações catalogadas por hemisfério.
 */

const A = require('../../services/astronomyService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}


module.exports = {
    name: 'constelacoes',
    aliases: ["mapaceleste"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Constelações catalogadas por hemisfério',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CONSTELAÇÕES', '✨')
    const porHem = {}
    for (const [k, c] of Object.entries(A.CONSTELACOES)) {
        if (!porHem[c.hemisferio]) porHem[c.hemisferio] = []
        porHem[c.hemisferio].push({ chave: k, ...c })
    }
    doc += linha('Constelações', String(Object.keys(A.CONSTELACOES).length)) + '\n'
    for (const [h, lista] of Object.entries(porHem)) {
        doc += bloco('HEMISFÉRIO ' + h.toUpperCase(), lista.map(c => c.nome + ' (' + c.melhorepoca + ') `' + prefix + 'constelacao' + c.chave + '`'))
    }
    return reply(doc)
    }
}
