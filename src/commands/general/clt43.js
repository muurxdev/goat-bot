/**
 * Comando .calcularfgts — FGTS
 *
 * Depósito mensal, saldo acumulado e multa.
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
    name: 'calcularfgts',
    aliases: ["fgts"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Depósito mensal, saldo acumulado e multa',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const salario = L.lerNumero(args[0])
    const meses = parseInt(args[1], 10) || 12
    if (!Number.isFinite(salario) || salario <= 0) {
        let doc = cab('FGTS', '🏦')
        doc += '📌 Uso: `' + prefix + 'calcularfgts <salário> [meses trabalhados]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'calcularfgts 3000 24`\n\n'
        doc += '_8% do salário, depositados pela empresa. Não sai do seu bolso._'
        return reply(doc)
    }
    const r = L.fgts({ salario, meses })
    let doc = cab('FGTS', '🏦')
    doc += linha('Salário', L.moeda(salario))
    doc += linha('Período', r.meses + ' meses')
    doc += sep()
    doc += bloco('💰 SALDO (sem rendimento)', [
        'Depósito mensal: ' + L.moeda(r.mensal),
        'Acumulado: *' + L.moeda(r.acumulado) + '*',
        'Multa de 40% (sem justa causa): ' + L.moeda(r.multa40),
        'Multa de 20% (acordo): ' + L.moeda(r.multa20)
    ])
    doc += '\n⚠️ _Estimativa sem os rendimentos da conta e sem 13º, que também gera depósito._\n'
    doc += '🔎 _Confira os depósitos reais mês a mês no app FGTS — empresa que não deposita é problema comum:_ `' + prefix + 'problemafgtsnaodepositado`'
    return reply(doc)
    }
}
