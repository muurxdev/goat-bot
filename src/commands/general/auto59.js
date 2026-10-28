/**
 * Comando .emergenciasestrada — EMERGÊNCIAS NA ESTRADA
 *
 * O que fazer em cada apuro na estrada.
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
    name: 'emergenciasestrada',
    aliases: ["socorroestrada"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'O que fazer em cada apuro na estrada',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('EMERGÊNCIAS NA ESTRADA', '🆘')
    doc += linha('Situações', String(Object.keys(A.EMERGENCIAS).length)) + '\n'
    for (const [k, e] of Object.entries(A.EMERGENCIAS)) {
        doc += '┃ *' + e.nome + '* — prioridade ' + e.prioridade + '\n┃    `' + prefix + 'emergencia' + k + '`\n'
    }
    doc += '\n☎️ *Telefones*\n190 polícia · 192 SAMU · 193 bombeiros · 191 rodovia federal\n\n'
    doc += '_A regra que vale para quase todas: sinalize primeiro, saia da pista e espere atrás da defensa, nunca dentro do carro._'
    return reply(doc)
    }
}
