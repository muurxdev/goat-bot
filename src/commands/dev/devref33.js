/**
 * Comando .padraobuilder — BUILDER
 *
 * Padrão de projeto: Builder.
 */

const R = require('../../services/devReferenceService')

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
    name: 'padraobuilder',
    aliases: ["patternbuilder","cmd_padraobuilder","alt_padraobuilder","atalho_padraobuilder","abrev_padraobuilder","call_padraobuilder","func_padraobuilder"],
    category: 'dev',
    subcategory: 'Referência',
    description: 'Padrão de projeto: Builder',
    cooldownMs: 2500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = R.PADROES['builder']
    let doc = cab(p.nome.toUpperCase(), '🧩')
    doc += linha('Família', p.familia)
    doc += sep()
    doc += linha('Problema', p.problema)
    doc += linha('Solução', p.solucao)
    doc += linha('Cuidado', p.cuidado)
    return reply(doc)
    }
}
