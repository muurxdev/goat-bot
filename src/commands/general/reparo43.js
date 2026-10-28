/**
 * Comando .tabelaconsumo — CONSUMO DOS APARELHOS
 *
 * Quanto cada aparelho da casa custa por mês.
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
    name: 'tabelaconsumo',
    aliases: ["aparelhosconsumo"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Quanto cada aparelho da casa custa por mês',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const tarifa = H.lerNumero(args[0]) || H.TARIFA_KWH_PADRAO
    const lista = H.APARELHOS.map(a => {
        const c = H.consumoAparelho({ watts: a.watts, horasPorDia: a.horas, tarifa })
        return { ...a, ...c }
    }).sort((x, y) => y.custoMes - x.custoMes)
    let doc = cab('CONSUMO DOS APARELHOS', '📊')
    doc += linha('Tarifa', H.moeda(tarifa) + '/kWh')
    doc += linha('Aparelhos', String(lista.length))
    doc += sep()
    for (const a of lista) {
        doc += '┃ *' + a.nome + '*\n'
        doc += '┃    ' + H.num(a.watts, 0) + ' W · ' + H.num(a.horas, 1) + ' h/dia\n'
        doc += '┃    ' + H.num(a.kwhMes, 1) + ' kWh = *' + H.moeda(a.custoMes) + '/mês*\n'
    }
    const led = lista.find(a => /LED 9/.test(a.nome))
    const inc = lista.find(a => /incandescente/.test(a.nome))
    if (led && inc) {
        doc += '\n💡 *A troca que se paga sozinha*\nTrocar uma incandescente de 60 W por LED de 9 W economiza ' + H.moeda(inc.custoMes - led.custoMes) + ' por mês nessa lâmpada. Multiplique pelas lâmpadas da casa.\n'
    }
    doc += '\n_Horas por dia são uso típico. Calcule o seu:_ `' + prefix + 'gastoluz 5500 0,5`'
    return reply(doc)
    }
}
