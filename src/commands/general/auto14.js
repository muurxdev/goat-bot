/**
 * Comando .luzneblina — FAROL DE NEBLINA
 *
 * Luz do painel: Farol de neblina — o que significa e o que fazer.
 */

const A = require('../../services/autoService')

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
    name: 'luzneblina',
    aliases: ["painelneblina"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Luz do painel: Farol de neblina — o que significa e o que fazer',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const l = A.LUZES['neblina']
    let doc = cab("FAROL DE NEBLINA", '🟢')
    doc += linha('Cor', l.cor)
    doc += linha('Gravidade', l.gravidade)
    doc += sep()
    doc += '📖 *O que significa*\n' + l.significa + '\n\n'
    doc += '🚦 *O que fazer agora*\n' + l.agora + '\n\n'
    doc += '⚠️ *O risco de ignorar*\n' + l.risco + '\n\n'
    doc += '🔴 _Vermelho manda parar · 🟡 amarelo manda providenciar · 🔵🟢 só avisam que algo está ligado_\n'
    doc += '💡 _Todas as luzes:_ `' + prefix + 'luzespainel`'
    return reply(doc)
    }
}
