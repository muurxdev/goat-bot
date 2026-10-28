/**
 * Comando .pesoemoutromundo — SEU PESO EM OUTRO MUNDO
 *
 * Converte seu peso para a gravidade de cada corpo.
 */

const A = require('../../services/astronomyService')

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
    name: 'pesoemoutromundo',
    aliases: ["seupeso"],
    category: 'general',
    subcategory: 'Astronomia',
    description: 'Converte seu peso para a gravidade de cada corpo',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const kg = parseFloat(String(args[0] || '').replace(',', '.'))
    if (!Number.isFinite(kg) || kg <= 0) return reply('⚖️ 📌 Uso: `' + prefix + 'pesoemoutromundo 72`')
    let doc = cab('SEU PESO EM OUTRO MUNDO', '⚖️')
    doc += linha('Na Terra', kg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg')
    doc += sep()
    const ord = Object.entries(A.CORPOS).sort((a, b) => b[1].gravidade - a[1].gravidade)
    for (const [, c] of ord) {
        doc += '┃ *' + c.nome + '* — ' + (kg * c.gravidade / 9.81).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg\n'
    }
    doc += '\n_A massa não muda; o que muda é o quanto a gravidade puxa._'
    return reply(doc)
    }
}
