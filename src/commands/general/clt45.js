/**
 * Comando .calcularaviso — AVISO PRÉVIO
 *
 * Quantos dias de aviso por tempo de casa.
 */

const L = require('../../services/laborService')

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
    name: 'calcularaviso',
    aliases: ["avisoprevio"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Quantos dias de aviso por tempo de casa',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const anos = parseInt(args[0], 10)
    if (!Number.isFinite(anos) || anos < 0) {
        let doc = cab('AVISO PRÉVIO', '📅')
        doc += '📌 Uso: `' + prefix + 'calcularaviso <anos completos na empresa>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'calcularaviso 5`\n\n'
        doc += '_30 dias + 3 por ano completo, teto de 90._'
        return reply(doc)
    }
    const dias = L.avisoPrevio(anos)
    let doc = cab('AVISO PRÉVIO', '📅')
    doc += linha('Tempo de casa', anos + (anos === 1 ? ' ano' : ' anos'))
    doc += sep()
    doc += '📅 *' + dias + ' dias de aviso*\n'
    doc += '_30 base + ' + (dias - 30) + ' por tempo de casa' + (dias === 90 ? ' (no teto)' : '') + '._\n\n'
    doc += bloco('📋 TABELA', [0, 1, 5, 10, 20].map(a => a + (a === 1 ? ' ano' : ' anos') + ' → ' + L.avisoPrevio(a) + ' dias'))
    doc += '\n⚠️ *Só vale a favor do trabalhador*\nOs dias extras por tempo de casa são devidos quando a empresa demite. Se o trabalhador pede demissão, o aviso dele continua sendo de 30 dias.'
    return reply(doc)
    }
}
