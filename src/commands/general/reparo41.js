/**
 * Comando .calcularpiso — QUANTAS CAIXAS DE PISO
 *
 * Caixas de piso ou azulejo, já com a perda do corte.
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
    name: 'calcularpiso',
    aliases: ["quantopiso","azulejo"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Caixas de piso ou azulejo, já com a perda do corte',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const larg = H.lerNumero(args[0])
    const comp = H.lerNumero(args[1])
    const porCaixa = H.lerNumero(args[2]) || 2
    const perda = H.lerNumero(args[3])
    const r = H.piso({ largura: larg, comprimento: comp, m2PorCaixa: porCaixa, perdaPct: Number.isFinite(perda) ? perda : 10 })
    if (!r) {
        let doc = cab('QUANTAS CAIXAS DE PISO', '🧱')
        doc += '📌 Uso: `' + prefix + 'calcularpiso <largura> <comprimento> [m² por caixa] [perda %]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'calcularpiso 3 4 2,2`\n\n'
        doc += '_A perda padrão é 10%. Use 15% para assentamento diagonal e 20% para ambiente com muitos recortes._'
        return reply(doc)
    }
    let doc = cab('QUANTAS CAIXAS DE PISO', '🧱')
    doc += linha('Ambiente', H.num(larg, 1) + ' × ' + H.num(comp, 1) + ' m')
    doc += linha('Área', H.num(r.area) + ' m²')
    doc += linha('Perda considerada', H.num(r.perda, 0) + '%')
    doc += linha('Por caixa', H.num(r.porCaixa) + ' m²')
    doc += sep()
    doc += '🧱 *' + r.caixas + ' caixa(s)* — ' + H.num(r.m2Comprados) + ' m²\n'
    doc += '_Área com perda: ' + H.num(r.comPerda) + ' m² · sobra ' + H.num(r.sobra) + ' m²_\n\n'
    doc += '💡 *Guarde a sobra*\nPeça quebrada anos depois não se acha no mesmo lote, e a diferença de tom aparece.\n\n'
    doc += '🪣 _Argamassa para assentar:_ `' + prefix + 'calcularargamassa ' + Math.ceil(r.area) + '`'
    return reply(doc)
    }
}
