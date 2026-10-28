/**
 * Comando .emergenciadigital — JÁ ACONTECEU
 *
 * O que fazer depois que o problema já ocorreu.
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
    name: 'emergenciadigital',
    aliases: ["jaaconteceu","fuihackeado"],
    category: 'general',
    subcategory: 'Segurança Digital',
    description: 'O que fazer depois que o problema já ocorreu',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', isGroup, prefix = '.' }) => {
    const ordem = { 'máxima': 0, 'alta': 1, 'média': 2, 'contínua': 3 }
    const lista = Object.entries(D.SITUACOES).sort((a, b) => (ordem[a[1].urgencia] ?? 9) - (ordem[b[1].urgencia] ?? 9))
    let doc = cab('JÁ ACONTECEU', '🚨')
    doc += linha('Situações', String(lista.length)) + '\n'
    for (const [k, s] of lista) {
        doc += '┃ *' + s.nome + '* — urgência ' + s.urgencia + '\n┃    `' + prefix + 'emergencia' + k + '`\n'
    }
    doc += '\n⚡ *A ordem que vale para quase todas*\n'
    doc += '┃ 1. Recupere o acesso antes de qualquer outra coisa\n'
    doc += '┃ 2. Troque a senha e ative as duas etapas\n'
    doc += '┃ 3. Desconecte os aparelhos que você não reconhece\n'
    doc += '┃ 4. Avise quem pode ser abordado em seu nome\n'
    doc += '┃ 5. Registre boletim de ocorrência\n\n'
    doc += '🎣 _Reconhecer o golpe antes de cair:_ `' + prefix + 'listagolpes`'
    return reply(doc)
    }
}
