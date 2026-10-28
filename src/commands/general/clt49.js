/**
 * Comando .problemastrabalho — DEU PROBLEMA NO TRABALHO
 *
 * O que fazer em cada situação, com onde procurar.
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
    name: 'problemastrabalho',
    aliases: ["deuproblema"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'O que fazer em cada situação, com onde procurar',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('DEU PROBLEMA NO TRABALHO', '🆘')
    doc += linha('Situações', String(Object.keys(L.SITUACOES).length)) + '\n'
    for (const [k, s] of Object.entries(L.SITUACOES)) {
        doc += '┃ *' + s.nome + '* — urgência ' + s.urgencia + '\n┃    `' + prefix + 'problema' + k + '`\n'
    }
    doc += '\n_Cada ficha traz o que a lei diz, os passos e onde procurar._\n'
    doc += '_Orientação geral. Caso concreto pede advogado ou sindicato._'
    return reply(doc)
    }
}
