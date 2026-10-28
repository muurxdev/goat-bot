/**
 * Comando .golpepremiacao — PRÊMIO DE SORTEIO QUE VOCÊ NÃO FEZ
 *
 * Como reconhecer o golpe: prêmio de sorteio que você não fez.
 */

const C = require('../../services/civicService')

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
    name: 'golpepremiacao',
    aliases: ["fraudepremiacao"],
    category: 'general',
    subcategory: 'Vida Prática',
    description: 'Como reconhecer o golpe: prêmio de sorteio que você não fez',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const g = C.GOLPES['premiacao']
    let doc = cab("PRÊMIO DE SORTEIO QUE VOCÊ NÃO FEZ", '🚨')
    doc += linha('Chega por', g.canal)
    doc += sep()
    doc += '🎣 *A isca*\n' + g.isca + '\n\n'
    doc += '🔍 *O sinal que entrega*\n' + g.sinal + '\n\n'
    doc += '🛡️ *Como se proteger*\n' + g.defesa + '\n\n'
    doc += '📢 _Repasse no grupo: quem conhece o golpe não cai nele._'
    return reply(doc)
    }
}
