/**
 * Comando .caolhasa — LHASA APSO
 *
 * Raça de cão Lhasa Apso: temperamento, exercício e cuidados.
 */

const H = require('../../services/homeLifeService')

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
    name: 'caolhasa',
    aliases: ["racalhasa"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Raça de cão Lhasa Apso: temperamento, exercício e cuidados',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const c = H.CAES['lhasa']
    let doc = cab("LHASA APSO", '🐕')
    doc += linha('Porte', c.porte)
    doc += linha('Energia', c.energia)
    doc += linha('Pelo', c.pelo)
    doc += linha('Expectativa', c.vida)
    doc += sep()
    doc += '🧠 *Temperamento*\n' + c.temperamento + '\n\n'
    doc += '🏃 *Exercício*\n' + c.exercicio + '\n\n'
    doc += '⚠️ *Atenção*\n' + c.atencao + '\n\n'
    doc += '_A ficha descreve a tendência da raça. Todo cão desmente a própria ficha em algum ponto._\n'
    doc += '🐕 _Todas as raças:_ `' + prefix + 'racascaes`'
    return reply(doc)
    }
}
