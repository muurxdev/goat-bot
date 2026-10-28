/**
 * Comando .gastoluz — CONSUMO DE ENERGIA
 *
 * kWh e reais por mês de um aparelho, com a tarifa da conta do usuário.
 * A conta vive em services/homeRepairService; aqui só a apresentação.
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

module.exports = {
    name: 'gastoluz',
    aliases: ["contaluz","consumoenergia"],
    category: 'general',
    subcategory: 'Utilidades & Telefonia',
    description: 'Quanto um aparelho consome em kWh e quanto custa por mês',
    cooldownMs: 2000,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)
        const watts = H.lerNumero(partes[0])
        const horas = H.lerNumero(partes[1])
        const tarifa = H.lerNumero(partes[2]) || H.TARIFA_KWH_PADRAO
        const r = H.consumoAparelho({ watts, horasPorDia: horas, tarifa })

        if (!r) {
            let doc = cab('CONSUMO DE ENERGIA', '⚡')
            doc += '📌 Uso: `' + prefix + 'gastoluz <watts> <horas por dia> [tarifa R$/kWh]`\n\n'
            doc += '🧮 *Exemplos*\n'
            doc += '`' + prefix + 'gastoluz 5500 0,5` — chuveiro, meia hora por dia\n'
            doc += '`' + prefix + 'gastoluz 900 8 1,05` — ar-condicionado com a sua tarifa\n\n'
            doc += '_A potência em watts está na etiqueta do aparelho; a tarifa, na sua conta de luz._\n'
            doc += '📊 _Aparelhos comuns já calculados:_ `' + prefix + 'tabelaconsumo`'
            return reply(doc)
        }

        let doc = cab('CONSUMO DE ENERGIA', '⚡')
        doc += linha('Potência', H.num(r.watts, 0) + ' W')
        doc += linha('Uso', H.num(r.horasPorDia, 1) + ' h/dia')
        doc += linha('Tarifa', H.moeda(r.tarifa) + '/kWh')
        doc += sep()
        doc += bloco('💡 CONSUMO', [
            'Por dia: ' + H.num(r.kwhDia, 2) + ' kWh = ' + H.moeda(r.kwhDia * r.tarifa),
            'Por mês: *' + H.num(r.kwhMes, 1) + ' kWh* = *' + H.moeda(r.custoMes) + '*',
            'Por ano: ' + H.moeda(r.custoAno)
        ])
        doc += '\n_Tarifa padrão quando você não informa: ' + H.moeda(H.TARIFA_KWH_PADRAO) + '/kWh. A real está na sua conta e muda por estado e bandeira._\n'
        doc += '📊 _Comparar com outros aparelhos:_ `' + prefix + 'tabelaconsumo`'
        return reply(doc)
    }
}
