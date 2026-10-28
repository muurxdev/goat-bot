/**
 * Comando .montartreino — TREINO DO DIA
 *
 * Monta um treino do dia com exercícios do catálogo.
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
    name: 'montartreino',
    aliases: ["treinododia"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Monta um treino do dia com exercícios do catálogo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const hoje = new Date()
    const semente = hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate()
    const chaves = Object.keys(L.EXERCICIOS)
    const escolhidos = []
    let s = semente
    while (escolhidos.length < 5 && escolhidos.length < chaves.length) {
        s = (s * 1103515245 + 12345) % 2147483648
        const c = chaves[s % chaves.length]
        if (!escolhidos.includes(c)) escolhidos.push(c)
    }
    let doc = cab('TREINO DO DIA', '🏋️')
    doc += linha('Data', hoje.toLocaleDateString('pt-BR'))
    doc += linha('Blocos', String(escolhidos.length))
    doc += sep()
    escolhidos.forEach((c, i) => {
        const x = L.EXERCICIOS[c]
        const series = 3 + (i % 2)
        doc += '┃ *' + (i + 1) + '. ' + x.nome + '*\n'
        doc += '┃    ' + series + ' séries · ' + x.grupo + '\n'
        doc += '┃    `' + prefix + 'exercicio' + c + '`\n'
    })
    doc += '\n⏱️ _Descanse de 60 a 90 segundos entre as séries._\n'
    doc += '_Este é um roteiro genérico, não uma prescrição individual._'
    return reply(doc)
    }
}
