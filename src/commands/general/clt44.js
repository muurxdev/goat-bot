/**
 * Comando .valetransporte — VALE-TRANSPORTE
 *
 * Quanto é descontado e quanto a empresa paga.
 */

const L = require('../../services/laborService')

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
    name: 'valetransporte',
    aliases: ["vt"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Quanto é descontado e quanto a empresa paga',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const salario = L.lerNumero(args[0])
    const custo = L.lerNumero(args[1])
    const dias = parseInt(args[2], 10) || 22
    if (!Number.isFinite(salario) || !Number.isFinite(custo)) {
        let doc = cab('VALE-TRANSPORTE', '🚌')
        doc += '📌 Uso: `' + prefix + 'valetransporte <salário> <custo por dia> [dias úteis]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'valetransporte 1800 12,80 22`\n\n'
        doc += '_O desconto é limitado a 6% do salário._'
        return reply(doc)
    }
    const r = L.valeTransporte({ salario, custoDiario: custo, diasUteis: dias })
    let doc = cab('VALE-TRANSPORTE', '🚌')
    doc += linha('Salário', L.moeda(salario))
    doc += linha('Custo no mês', L.moeda(r.custoTotal) + ' (' + dias + ' dias)')
    doc += sep()
    doc += bloco('🧮 A DIVISÃO', [
        'Teto do desconto (6%): ' + L.moeda(r.teto),
        'Descontado de você: *' + L.moeda(r.desconto) + '*',
        'Pago pela empresa: *' + L.moeda(r.empresaPaga) + '*'
    ])
    doc += '\n' + (r.limitadoPeloTeto
        ? '✅ _O custo passou dos 6%, então a diferença é da empresa._'
        : '_O custo cabe dentro dos 6%, então o desconto é o valor integral._')
    return reply(doc)
    }
}
