/**
 * Comando .decimoterceiro — 13º SALÁRIO
 *
 * Calcula as duas parcelas do 13º.
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
    name: 'decimoterceiro',
    aliases: ["calcular13","natalino"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Calcula as duas parcelas do 13º',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const salario = L.lerNumero(args[0])
    const meses = parseInt(args[1], 10) || 12
    const dep = parseInt(args[2], 10) || 0
    if (!Number.isFinite(salario) || salario <= 0) {
        let doc = cab('13º SALÁRIO', '🎄')
        doc += '📌 Uso: `' + prefix + 'decimoterceiro <salário> [meses trabalhados] [dependentes]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'decimoterceiro 3000 8`\n\n'
        doc += '_Mês com 15 dias ou mais conta como mês inteiro._'
        return reply(doc)
    }
    const r = L.decimoTerceiro({ salario, meses, dependentes: dep })
    let doc = cab('13º SALÁRIO', '🎄')
    doc += linha('Salário', L.moeda(salario))
    doc += linha('Avos', r.meses + '/12')
    doc += sep()
    doc += bloco('📅 AS DUAS PARCELAS', [
        '*1ª (até 30/nov):* ' + L.moeda(r.primeira) + ' — sem descontos',
        '*2ª (até 20/dez):* ' + L.moeda(r.segunda) + ' — com INSS e IRRF'
    ])
    doc += '\n╭━〔 📉 DESCONTOS (na 2ª) 〕━⬣\n'
    doc += '┃ INSS: ' + L.moeda(r.inss.valor) + '\n'
    doc += '┃ IRRF: ' + L.moeda(r.irrf.valor) + (r.irrf.isento ? ' _(isento)_' : '') + '\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '💵 *Total no ano: ' + L.moeda(r.liquidoTotal) + '*\n\n'
    doc += '⚠️ _Os descontos incidem sobre o 13º inteiro, mas caem todos na segunda parcela — por isso ela vem bem menor que a primeira._'
    return reply(doc)
    }
}
