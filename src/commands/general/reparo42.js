/**
 * Comando .calcularargamassa — QUANTA ARGAMASSA
 *
 * Sacos de argamassa para assentar uma área.
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
    name: 'calcularargamassa',
    aliases: ["quantocimento"],
    category: 'general',
    subcategory: 'Casa e Reparos',
    description: 'Sacos de argamassa para assentar uma área',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const area = H.lerNumero(args[0])
    const esp = H.lerNumero(args[1]) || 8
    const r = H.argamassa({ area, espessuraMm: esp })
    if (!r) {
        let doc = cab('QUANTA ARGAMASSA', '🪣')
        doc += '📌 Uso: `' + prefix + 'calcularargamassa <m²> [espessura em mm]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'calcularargamassa 12`\n\n'
        doc += '_Espessura padrão: 8 mm. Piso sobre contrapiso irregular pede mais._'
        return reply(doc)
    }
    let doc = cab('QUANTA ARGAMASSA', '🪣')
    doc += linha('Área', H.num(r.area) + ' m²')
    doc += linha('Espessura', H.num(r.espessuraMm, 0) + ' mm')
    doc += sep()
    doc += '🪣 *' + H.num(r.kg, 0) + ' kg* → *' + r.sacos20 + ' saco(s) de 20 kg*\n'
    doc += '_Comprando ' + H.num(r.kgComprados, 0) + ' kg._\n\n'
    doc += '💡 _Regra usada: cerca de 1,7 kg por m² a cada milímetro de espessura._\n'
    doc += '⚠️ _Argamassa preparada tem validade de poucas horas. Misture só o que vai usar._'
    return reply(doc)
    }
}
