/**
 * Comando .direitohorasextras — HORAS EXTRAS
 *
 * Direito trabalhista: Horas extras.
 */

const L = require('../../services/laborService')

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
    name: 'direitohorasextras',
    aliases: ["sobrehorasextras"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Direito trabalhista: Horas extras',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = L.DIREITOS['horasextras']
    let doc = cab("HORAS EXTRAS", '⚖️')
    doc += linha('Quem tem', d.quem)
    doc += linha('Base legal', d.base)
    doc += sep()
    doc += '📖 *O que é*\n' + d.oquee + '\n\n'
    doc += '📐 *Como funciona*\n' + d.detalhe + '\n\n'
    doc += '⚠️ *O ponto que gera mais dúvida*\n' + d.pegadinha + '\n\n'
    doc += '⚖️ _Todos os direitos:_ `' + prefix + 'direitostrabalhistas`\n'
    doc += '_Resumo informativo. Convenção coletiva da sua categoria pode ser mais favorável._'
    return reply(doc)
    }
}
