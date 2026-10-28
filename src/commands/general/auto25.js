/**
 * Comando .trocarpastilhas — PASTILHAS DE FREIO
 *
 * Manutenção: Pastilhas de freio — quando trocar e o sinal de que está na hora.
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
    name: 'trocarpastilhas',
    aliases: ["pecapastilhas"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Manutenção: Pastilhas de freio — quando trocar e o sinal de que está na hora',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const m = A.MANUTENCAO['pastilhas']
    let doc = cab("PASTILHAS DE FREIO", '🔧')
    doc += linha('Trocar a cada', m.prazo)
    doc += linha('Custo relativo', m.custo)
    doc += sep()
    doc += '⚙️ *Para que serve*\n' + m.porque + '\n\n'
    doc += '🔎 *Sinal de que está na hora*\n' + m.sinal + '\n\n'
    doc += '⚠️ *Se ignorar*\n' + m.seignorar + '\n\n'
    doc += '🔧 _Plano completo:_ `' + prefix + 'manutencaopreventiva`'
    return reply(doc)
    }
}
