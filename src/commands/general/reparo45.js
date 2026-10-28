/**
 * Comando .menucasa — CENTRAL DA CASA
 *
 * Índice de reparos, ferramentas e contas de obra.
 */

const H = require('../../services/homeRepairService')

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
    name: 'menucasa',
    aliases: ["centraldacasa"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Índice de reparos, ferramentas e contas de obra',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    let doc = cab('CENTRAL DA CASA', '🏠')
    doc += bloco('🔧 QUEBROU ALGO', [
        '`' + prefix + 'reparoscasa` — 15 problemas com passo a passo',
        '`' + prefix + 'reparoscasa fácil` — só o que dá para resolver hoje',
        '`' + prefix + 'buscarcasareparo vazamento` — buscar pelo sintoma'
    ])
    doc += bloco('🛠️ FERRAMENTA', [
        '`' + prefix + 'ferramentas` — para que serve cada uma',
        '`' + prefix + 'segurancasnacasa` — o que não se negocia'
    ])
    doc += bloco('🧮 VAI COMPRAR MATERIAL', [
        '`' + prefix + 'calculartinta 3 4` — litros e latas',
        '`' + prefix + 'calcularpiso 3 4 2,2` — caixas com a perda do corte',
        '`' + prefix + 'calcularargamassa 12` — sacos de 20 kg'
    ])
    doc += bloco('⚡ CONTA DE LUZ', [
        '`' + prefix + 'tabelaconsumo` — quanto custa cada aparelho',
        '`' + prefix + 'gastoluz 5500 0,5` — calcular o seu'
    ])
    doc += '\n🪴 _Plantas e bichos da casa:_ `' + prefix + 'plantas`'
    return reply(doc)
    }
}
