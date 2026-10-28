/**
 * Comando .infracoestransito — INFRAÇÕES DE TRÂNSITO
 *
 * Principais infrações do CTB com pontos e valor.
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
    name: 'infracoestransito',
    aliases: ["multastransito","ctb"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Principais infrações do CTB com pontos e valor',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const ord = Object.entries(A.INFRACOES).sort((a, b) => b[1].valor - a[1].valor)
    let doc = cab('INFRAÇÕES DE TRÂNSITO', '🚨')
    doc += linha('Infrações', String(ord.length))
    doc += linha('Vigência', A.VIGENCIA_CTB) + '\n'
    for (const [k, i] of ord) {
        doc += '┃ *' + i.nome + '*\n┃    ' + A.moeda(i.valor) + ' · ' + i.pontos + ' pontos · ' + i.gravidade + '\n┃    `' + prefix + 'infracao' + k + '`\n'
    }
    doc += '\n📋 *Limite de pontos:* 20 em 12 meses (14 com uma gravíssima, 11 com duas ou mais)\n'
    doc += '_Valores do CTB, vigência ' + A.VIGENCIA_CTB + '. Conferem no Detran do seu estado._'
    return reply(doc)
    }
}
