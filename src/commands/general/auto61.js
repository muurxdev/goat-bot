/**
 * Comando .consumocarro — CONSUMO DO CARRO
 *
 * Calcula km/l e o custo por quilômetro.
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
    name: 'consumocarro',
    aliases: ["kmlitro","mediacarro"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Calcula km/l e o custo por quilômetro',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const km = A.lerNumero(args[0])
    const litros = A.lerNumero(args[1])
    const preco = A.lerNumero(args[2]) || 0
    const r = A.consumo({ km, litros, precoLitro: preco })
    if (!r) {
        let doc = cab('CONSUMO DO CARRO', '📊')
        doc += '📌 Uso: `' + prefix + 'consumocarro <km rodados> <litros abastecidos> [preço do litro]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'consumocarro 420 35 5,89`\n\n'
        doc += '_Encha o tanque, zere o hodômetro, rode e encha de novo: os litros do segundo abastecimento são o consumo real do trecho._'
        return reply(doc)
    }
    let doc = cab('CONSUMO DO CARRO', '📊')
    doc += linha('Rodou', A.num(r.km, 0) + ' km')
    doc += linha('Gastou', A.num(r.litros, 1) + ' L')
    doc += sep()
    doc += '📊 *Média: ' + A.num(r.kml) + ' km/L*\n\n'
    if (r.custoPorKm) {
        doc += bloco('💰 CUSTO', [
            'Por quilômetro: ' + A.moeda(r.custoPorKm),
            'A cada 100 km: ' + A.moeda(r.custo100km)
        ])
    } else {
        doc += '_Informe o preço do litro para ver o custo por quilômetro._\n'
    }
    doc += '\n🗺️ _Calcular uma viagem:_ `' + prefix + 'custoviagem 300 ' + A.num(r.kml, 0) + ' 5,89`'
    return reply(doc)
    }
}
