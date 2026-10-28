/**
 * Comando .praticadispositivosconectados — SESSÕES E APARELHOS CONECTADOS
 *
 * Segurança digital: Sessões e aparelhos conectados.
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
    name: 'praticadispositivosconectados',
    aliases: ["segurancadispositivosconectados"],
    category: 'general',
    subcategory: 'Segurança Digital',
    description: 'Segurança digital: Sessões e aparelhos conectados',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', isGroup, prefix = '.' }) => {
    const c = D.CONCEITOS['dispositivosconectados']
    let doc = cab("SESSÕES E APARELHOS CONECTADOS", '🛡️')
    doc += linha('Trabalho', c.dificuldade)
    doc += linha('Proteção', c.impacto)
    doc += sep()
    doc += '📖 *O que é*\n' + c.oquee + '\n\n'
    doc += '🎯 *Por que importa*\n' + c.porque + '\n\n'
    doc += '✅ *Como fazer*\n' + c.como + '\n\n'
    doc += '⚠️ *A pegadinha*\n' + c.pegadinha + '\n\n'
    doc += '🛡️ _Todas as práticas:_ `' + prefix + 'praticasseguranca`'
    return reply(doc)
    }
}
