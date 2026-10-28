/**
 * Comando .menucarro — CENTRAL DO CARRO
 *
 * Índice de tudo sobre carro, trânsito e combustível.
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
    name: 'menucarro',
    aliases: ["carro"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Índice de tudo sobre carro, trânsito e combustível',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CENTRAL DO CARRO', '🚘')
    doc += bloco('🚨 ACENDEU UMA LUZ', [
        '`' + prefix + 'luzespainel` — todas as luzes por cor',
        '`' + prefix + 'luzespainel vermelha` — as que mandam parar agora'
    ])
    doc += bloco('🔧 MANUTENÇÃO', [
        '`' + prefix + 'manutencaopreventiva` — o que trocar e quando',
        '`' + prefix + 'trocadeoleo 47300 41000` — quanto falta para a próxima'
    ])
    doc += bloco('⛽ COMBUSTÍVEL', [
        '`' + prefix + 'alcoolgasolina 3,99 5,89` — qual compensa hoje',
        '`' + prefix + 'consumocarro 420 35 5,89` — seu km/L real',
        '`' + prefix + 'custoviagem 300 12 5,89 24 4` — quanto custa e quanto cada um paga'
    ])
    doc += bloco('🚦 TRÂNSITO', [
        '`' + prefix + 'infracoestransito` — pontos e valores',
        '`' + prefix + 'pontoscnh` — quanto suspende',
        '`' + prefix + 'emergenciasestrada` — o que fazer no apuro'
    ])
    doc += '\n🪪 _Tirar ou renovar a CNH:_ `' + prefix + 'documentocnh`'
    return reply(doc)
    }
}
