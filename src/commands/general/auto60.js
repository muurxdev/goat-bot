/**
 * Comando .alcoolgasolina — ÁLCOOL OU GASOLINA
 *
 * Diz qual dos dois compensa pelos preços de hoje.
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
    name: 'alcoolgasolina',
    aliases: ["setentaporcento","qualabastecer"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Diz qual dos dois compensa pelos preços de hoje',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const alc = A.lerNumero(args[0])
    const gas = A.lerNumero(args[1])
    const r = A.alcoolOuGasolina(alc, gas)
    if (!r) {
        let doc = cab('ÁLCOOL OU GASOLINA', '⛽')
        doc += '📌 Uso: `' + prefix + 'alcoolgasolina <preço álcool> <preço gasolina>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'alcoolgasolina 3,99 5,89`\n\n'
        doc += '_A regra dos 70%: o álcool rende menos por litro, então só compensa se custar até 70% do preço da gasolina._'
        return reply(doc)
    }
    let doc = cab('ÁLCOOL OU GASOLINA', '⛽')
    doc += linha('Álcool', A.moeda(r.precoAlcool))
    doc += linha('Gasolina', A.moeda(r.precoGasolina))
    doc += linha('Razão', A.num(r.razao * 100, 1) + '% (limite: 70%)')
    doc += sep()
    doc += (r.vale === 'alcool'
        ? '🌱 *Compensa o ÁLCOOL*\nEle está a ' + A.num(r.razao * 100, 1) + '% do preço da gasolina, abaixo dos 70%.'
        : '⛽ *Compensa a GASOLINA*\nO álcool está a ' + A.num(r.razao * 100, 1) + '% do preço da gasolina, acima dos 70%.')
    doc += '\n\n'
    doc += '🎯 *Ponto de equilíbrio*\nCom a gasolina a ' + A.moeda(r.precoGasolina) + ', o álcool só valeria até ' + A.moeda(r.precoJusto) + '.\n\n'
    doc += '_A regra dos 70% vem do rendimento: o álcool entrega cerca de 30% menos quilômetros por litro. Carros específicos variam um pouco._'
    return reply(doc)
    }
}
