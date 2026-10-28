/**
 * Comando .custoviagem — CUSTO DA VIAGEM
 *
 * Combustível, pedágio, ida e volta e divisão entre passageiros.
 * A conta vive em services/autoService; aqui só a apresentação.
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

module.exports = {
    name: 'custoviagem',
    aliases: ["custoviagem-cmd","cmd-custoviagem","gastoviagem","rachargasolina"],
    category: 'general',
    subcategory: 'Finanças',
    description: 'Custo da viagem com pedágio, ida e volta e divisão entre os passageiros',
    cooldownMs: 1500,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)
        const dist = A.lerNumero(partes[0])
        const kml = A.lerNumero(partes[1])
        const preco = A.lerNumero(partes[2])
        const pedagio = A.lerNumero(partes[3]) || 0
        const pessoas = parseInt(partes[4], 10) || 1
        const ida = /ida|volta|iv/i.test(partes.join(' '))
        const r = A.custoViagem({ distancia: dist, kml, precoLitro: preco, pedagio, pessoas, idaEVolta: ida })

        if (!r) {
            let doc = cab('CUSTO DA VIAGEM', '🗺️')
            doc += '📌 Uso: `' + prefix + 'custoviagem <km> <km/L> <preço litro> [pedágio] [pessoas] [idaevolta]`\n\n'
            doc += '🧮 *Exemplo*\n`' + prefix + 'custoviagem 300 12 5,89 24 4 idaevolta`\n'
            doc += '_300 km, 12 km/L, gasolina a 5,89, R$ 24 de pedágio, 4 pessoas, ida e volta._\n\n'
            doc += '_Não sabe seu km/L?_ `' + prefix + 'consumocarro 420 35`'
            return reply(doc)
        }

        let doc = cab('CUSTO DA VIAGEM', '🗺️')
        doc += linha('Distância', A.num(r.distancia, 0) + ' km' + (r.idaEVolta ? ' (ida e volta)' : ''))
        doc += linha('Combustível', A.num(r.litros, 1) + ' L')
        doc += sep()
        doc += bloco('💰 A CONTA', [
            'Combustível: ' + A.moeda(r.combustivel),
            'Pedágio: ' + A.moeda(r.pedagio),
            'Total: *' + A.moeda(r.total) + '*',
            'Custo por km: ' + A.moeda(r.custoPorKm)
        ])
        if (r.pessoas > 1) doc += '\n👥 *Dividido por ' + r.pessoas + ': ' + A.moeda(r.porPessoa) + ' cada*\n'
        doc += '\n_Só combustível e pedágio. Desgaste de pneu, óleo e manutenção não entram, mas existem._\n'
        doc += '⛽ _Álcool ou gasolina hoje:_ `' + prefix + 'alcoolgasolina 3,99 5,89`'
        return reply(doc)
    }
}
