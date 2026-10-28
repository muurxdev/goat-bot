/**
 * Comando .reparoraloentupido — RALO ENTUPIDO
 *
 * Como resolver: ralo entupido.
 */

const H = require('../../services/homeRepairService')

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
    name: 'reparoraloentupido',
    aliases: ["consertarraloentupido"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Como resolver: ralo entupido',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = H.REPAROS['raloentupido']
    let doc = cab("RALO ENTUPIDO", '🔧')
    doc += linha('Dificuldade', r.dificuldade)
    doc += linha('Tempo', r.tempo)
    doc += linha('Custo', r.custo)
    doc += sep()
    doc += '🔍 *Causa provável*\n' + r.causa + '\n\n'
    doc += '╭━〔 ✅ PASSO A PASSO 〕━⬣\n'
    r.passos.forEach((p, i) => { doc += '┃ *' + (i + 1) + '.* ' + p + '\n' })
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '⚠️ *Atenção*\n' + r.atencao + '\n\n'
    doc += '🔧 _Todos os reparos:_ `' + prefix + 'reparoscasa`'
    return reply(doc)
    }
}
