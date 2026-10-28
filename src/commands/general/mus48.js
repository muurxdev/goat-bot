/**
 * Comando .campoharmonico — CAMPO HARMÔNICO
 *
 * Os sete acordes que combinam num tom maior.
 */

const M = require('../../services/musicService')

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
    name: 'campoharmonico',
    aliases: ["camposdotom","acordesdotom"],
    category: 'general',
    subcategory: 'Música',
    description: 'Os sete acordes que combinam num tom maior',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const tom = args[0]
    const r = tom ? M.campoHarmonico(tom) : null
    if (!r) {
        let doc = cab('CAMPO HARMÔNICO', '🎓')
        doc += '📌 Uso: `' + prefix + 'campoharmonico <tom>`\n\n'
        doc += '🧮 *Exemplos*\n`' + prefix + 'campoharmonico C`   `' + prefix + 'campoharmonico F`   `' + prefix + 'campoharmonico G`\n\n'
        doc += '_São os acordes que soam naturais juntos naquele tom. Serve para compor e para tirar música de ouvido._'
        return reply(doc)
    }
    let doc = cab('CAMPO HARMÔNICO DE ' + r.tonica, '🎓')
    doc += linha('Tônica', r.tonica + (M.NOTAS_PT[r.tonica[0]] ? ' (' + M.NOTAS_PT[r.tonica[0]] + ')' : ''))
    doc += sep()
    for (const g of r.graus) {
        doc += '┃ *' + g.grau.padEnd(4) + '* ' + g.acorde.padEnd(8) + ' — ' + g.funcao + '\n'
    }
    doc += '\n🎯 *Como usar*\nQualquer combinação desses sete soa natural. A progressão mais comum da música popular é I–V–vi–IV: '
    doc += r.graus[0].acorde + ' ' + r.graus[4].acorde + ' ' + r.graus[5].acorde + ' ' + r.graus[3].acorde + '.\n\n'
    doc += '🔄 _Círculo das quintas:_ `' + prefix + 'circuloquintas ' + r.tonica + '`'
    return reply(doc)
    }
}
