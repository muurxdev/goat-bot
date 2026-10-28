/**
 * Comando .emergenciacontafalsa — CRIARAM UMA CONTA COM SEU NOME
 *
 * Já aconteceu: criaram uma conta com seu nome — o que fazer agora.
 */

const D = require('../../services/digitalSafetyService')

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
    name: 'emergenciacontafalsa',
    aliases: ["aconteceucontafalsa"],
    category: 'general',
    subcategory: 'Segurança Digital',
    description: 'Já aconteceu: criaram uma conta com seu nome — o que fazer agora',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', isGroup, prefix = '.' }) => {
    const s = D.SITUACOES['contafalsa']
    let doc = cab("CRIARAM UMA CONTA COM SEU NOME", '🚨')
    doc += linha('Urgência', s.urgencia)
    doc += linha('Janela', s.janela)
    doc += sep()
    doc += '╭━〔 ✅ AGORA, NESTA ORDEM 〕━⬣\n'
    s.passos.forEach((p, i) => { doc += '┃ *' + (i + 1) + '.* ' + p + '\n' })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '🔒 *Como evitar da próxima vez*\n' + s.evitar + '\n\n'
    doc += '🚨 _Outras emergências:_ `' + prefix + 'emergenciadigital`'
    return reply(doc)
    }
}
