/**
 * Comando .exerciciobarrafixa — BARRA FIXA
 *
 * Execução e erros comuns do exercício barra fixa.
 */

const L = require('../../services/lifestyleService')

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
    name: 'exerciciobarrafixa',
    aliases: ["comofazerbarrafixa"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Execução e erros comuns do exercício barra fixa',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const x = L.EXERCICIOS['barrafixa']
    let doc = cab('BARRA FIXA', '💪')
    doc += linha('Trabalha', x.grupo)
    doc += linha('Nível', x.nivel)
    doc += linha('Equipamento', x.equipamento)
    doc += sep()
    doc += '✅ *Execução*\n' + x.execucao + '\n\n'
    doc += '⚠️ *Erro mais comum*\n' + x.erro + '\n\n'
    doc += '_Sente dor articular? Pare e procure um profissional._'
    doc += '\n\n🏋️ _Monte um treino:_ `' + prefix + 'montartreino`'
    return reply(doc)
    }
}
