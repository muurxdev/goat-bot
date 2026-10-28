/**
 * Comando .gatoangora — ANGORÁ
 *
 * Raça de gato Angorá: temperamento e cuidados.
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
    name: 'gatoangora',
    aliases: ["felinoangora"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Raça de gato Angorá: temperamento e cuidados',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const g = H.GATOS['angora']
    let doc = cab("ANGORÁ", '🐈')
    doc += linha('Porte', g.porte)
    doc += linha('Pelo', g.pelo)
    doc += linha('Energia', g.energia)
    doc += linha('Expectativa', g.vida)
    doc += sep()
    doc += '🧠 *Temperamento*\n' + g.temperamento + '\n\n'
    doc += '⚠️ *Atenção*\n' + g.atencao + '\n\n'
    doc += '_A ficha descreve a tendência da raça, não o indivíduo._\n'
    doc += '🐈 _Todas as raças:_ `' + prefix + 'racasgatos`'
    return reply(doc)
    }
}
