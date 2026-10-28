/**
 * Comando .calculartinta — QUANTA TINTA COMPRAR
 *
 * Litros de tinta e quais latas comprar para um ambiente.
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
    name: 'calculartinta',
    aliases: ["quantatinta","pintar"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Litros de tinta e quais latas comprar para um ambiente',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const larg = H.lerNumero(args[0])
    const comp = H.lerNumero(args[1])
    const pe = H.lerNumero(args[2]) || 2.7
    const demaos = parseInt(args[3], 10) || 2
    const aberturas = H.lerNumero(args[4]) || 0
    const r = H.tinta({ largura: larg, comprimento: comp, peDireito: pe, demaos, aberturas })
    if (!r) {
        let doc = cab('QUANTA TINTA COMPRAR', '🎨')
        doc += '📌 Uso: `' + prefix + 'calculartinta <largura> <comprimento> [pé-direito] [demãos] [m² de portas e janelas]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'calculartinta 3 4` — quarto de 3 × 4 m\n'
        doc += '`' + prefix + 'calculartinta 3 4 2,7 2 4` — descontando 4 m² de porta e janela\n\n'
        doc += '_Calcula as paredes. Para o teto, use largura × comprimento como área direta._'
        return reply(doc)
    }
    let doc = cab('QUANTA TINTA COMPRAR', '🎨')
    doc += linha('Ambiente', H.num(larg, 1) + ' × ' + H.num(comp, 1) + ' m, pé-direito ' + H.num(pe, 2) + ' m')
    doc += linha('Perímetro', H.num(r.perimetro, 1) + ' m')
    doc += linha('Área de parede', H.num(r.area) + ' m²' + (r.areaAberturas ? ' (já descontados ' + H.num(r.areaAberturas) + ' m²)' : ''))
    doc += linha('Demãos', String(r.demaos))
    doc += sep()
    doc += '🎨 *Precisa de ' + H.num(r.litros) + ' litros*\n\n'
    doc += bloco('🛒 O QUE COMPRAR', r.compra.map(c => c.quantidade + '× ' + c.nome))
    doc += '\n📦 Total comprado: ' + H.num(r.totalComprado) + ' L · sobra ' + H.num(r.sobra) + ' L\n\n'
    doc += '💡 *Por que sobra de propósito*\nRendimento de ' + r.rendimento + ' m²/L por demão é o de parede lisa e selada. Parede porosa ou cor forte sobre clara bebe mais — e faltar tinta no fim significa outra lata e outro lote de cor.'
    return reply(doc)
    }
}
