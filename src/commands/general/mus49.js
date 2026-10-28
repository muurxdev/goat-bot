/**
 * Comando .circuloquintas — CÍRCULO DAS QUINTAS
 *
 * Os tons vizinhos de um tom, para modular sem susto.
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
    name: 'circuloquintas',
    aliases: ["quintas"],
    category: 'general',
    subcategory: 'Música',
    description: 'Os tons vizinhos de um tom, para modular sem susto',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const tom = args[0]
    const r = tom ? M.circuloQuintas(tom) : null
    if (!r) {
        let doc = cab('CÍRCULO DAS QUINTAS', '🔄')
        doc += '📌 Uso: `' + prefix + 'circuloquintas <tom>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'circuloquintas C`\n\n'
        doc += '_Tons vizinhos no círculo compartilham quase todas as notas — por isso a modulação entre eles passa despercebida._'
        return reply(doc)
    }
    let doc = cab('CÍRCULO DAS QUINTAS', '🔄')
    doc += linha('Partindo de', r.tonica)
    doc += sep()
    doc += '➡️ *Sentido horário* (ganha sustenido)\n' + r.horario.join(' → ') + '\n\n'
    doc += '⬅️ *Sentido anti-horário* (ganha bemol)\n' + r.antihorario.join(' → ') + '\n\n'
    doc += '🎯 *Para que serve*\nOs vizinhos imediatos (' + r.horario[0] + ' e ' + r.antihorario[0] + ') diferem de ' + r.tonica + ' por uma única nota. '
    doc += 'É por isso que modular para eles soa suave, e pular para o lado oposto do círculo soa como uma virada brusca.\n\n'
    doc += '🎓 _Campo harmônico:_ `' + prefix + 'campoharmonico ' + r.tonica + '`'
    return reply(doc)
    }
}
