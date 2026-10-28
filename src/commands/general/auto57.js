/**
 * Comando .manutencaopreventiva — MANUTENÇÃO PREVENTIVA
 *
 * O que trocar, quando e o que acontece se ignorar.
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
    name: 'manutencaopreventiva',
    aliases: ["revisaocarro"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'O que trocar, quando e o que acontece se ignorar',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('MANUTENÇÃO PREVENTIVA', '🔧')
    doc += linha('Itens', String(Object.keys(A.MANUTENCAO).length)) + '\n'
    for (const [k, m] of Object.entries(A.MANUTENCAO)) {
        doc += '┃ *' + m.nome + '*\n┃    a cada ' + m.prazo + ' · custo ' + m.custo + '\n┃    `' + prefix + 'trocar' + k + '`\n'
    }
    doc += '\n🛢️ _Quando é a próxima troca de óleo:_ `' + prefix + 'trocadeoleo 47300 41000`'
    return reply(doc)
    }
}
