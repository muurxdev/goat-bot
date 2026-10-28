/**
 * Comando .exames — EXAMES COMUNS
 *
 * Exames de rotina: o que medem e se pedem jejum.
 */

const B = require('../../services/bodyService')

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
    name: 'exames',
    aliases: ["listaexames"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Exames de rotina: o que medem e se pedem jejum',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('EXAMES COMUNS', '🧪')
    doc += linha('Exames', String(Object.keys(B.EXAMES).length)) + '\n'
    for (const [k, e] of Object.entries(B.EXAMES)) {
        doc += '┃ *' + e.nome + '*\n┃    jejum: ' + e.jejum + '\n┃    `' + prefix + 'exame' + k + '`\n'
    }
    doc += '\n_Cada ficha traz o que mede, a faixa comum e para que serve._\n'
    doc += '_Interpretação de laudo é do médico, não da tabela._'
    return reply(doc)
    }
}
