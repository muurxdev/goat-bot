/**
 * Comando .pontoscnh — PONTOS NA CNH
 *
 * Quantos pontos suspendem e quanto vale cada infração.
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
    name: 'pontoscnh',
    aliases: ["limitepontos"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Quantos pontos suspendem e quanto vale cada infração',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('PONTOS NA CNH', '📋')
    doc += bloco('🚦 LIMITE PARA SUSPENSÃO (12 meses)', [
        '*20 pontos* — nenhuma infração gravíssima',
        '*14 pontos* — uma infração gravíssima',
        '*11 pontos* — duas ou mais gravíssimas'
    ])
    doc += bloco('⚖️ PONTOS POR GRAVIDADE', [
        'Leve — 3 pontos',
        'Média — 4 pontos',
        'Grave — 5 pontos',
        'Gravíssima — 7 pontos'
    ])
    doc += '\n🔎 *Motorista profissional*\nQuem usa a CNH para trabalhar não tem o limite reduzido: continua em 20 pontos, desde que faça o curso preventivo.\n\n'
    doc += '⏳ *Os pontos caem sozinhos*\nCada infração sai da contagem 12 meses depois da data em que foi cometida.\n\n'
    doc += '🚨 _Ver o que pontua:_ `' + prefix + 'infracoestransito`'
    return reply(doc)
    }
}
