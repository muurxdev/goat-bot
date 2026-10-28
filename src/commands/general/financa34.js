/**
 * Comando .jurocomposto — JUROS COMPOSTOS
 *
 * Simula capital, aporte mensal e prazo com juros compostos.
 */

const F = require('../../services/financeService')

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
    name: 'jurocomposto',
    aliases: ["simulacaojuros","jurosreais"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Simula capital, aporte mensal e prazo com juros compostos',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const capital = F.lerNumero(args[0])
    const taxa = F.lerNumero(args[1])
    const meses = F.lerNumero(args[2])
    const aporte = F.lerNumero(args[3]) || 0
    if (!Number.isFinite(capital) || !Number.isFinite(taxa) || !Number.isFinite(meses) || meses < 1) {
        let doc = cab('JUROS COMPOSTOS', '📈')
        doc += '📌 Uso: `' + prefix + 'jurocomposto <capital> <taxa % ao mês> <meses> [aporte mensal]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'jurocomposto 5000 0,9 120 300`\n'
        doc += '_R$ 5.000 iniciais, 0,9% ao mês, 10 anos, aportando R$ 300/mês._\n\n'
        doc += '💡 _Taxa anual → mensal:_ `' + prefix + 'convertertaxa 12 ano mes`'
        return reply(doc)
    }
    const r = F.jurosCompostos({ capital, taxaMensal: taxa, meses, aporte })
    let doc = cab('JUROS COMPOSTOS', '📈')
    doc += linha('Capital inicial', F.moeda(capital))
    doc += linha('Aporte mensal', F.moeda(aporte))
    doc += linha('Taxa', F.pct(taxa) + ' ao mês')
    doc += linha('Prazo', r.meses + ' meses (' + (r.meses / 12).toFixed(1).replace('.', ',') + ' anos)')
    doc += sep()
    doc += bloco('💰 RESULTADO', [
        'Total: *' + F.moeda(r.total) + '*',
        'Você investiu: ' + F.moeda(r.investido),
        'Juros ganhos: ' + F.moeda(r.juros),
        'Rendimento: ' + F.pct(r.rendimentoPct)
    ])
    const parteJuros = r.total > 0 ? r.juros / r.total : 0
    doc += '\n📊 *Quanto do total é juro*\n' + barra(parteJuros) + '\n\n'
    doc += '╭━〔 📅 EVOLUÇÃO 〕━⬣\n'
    for (const p of F.evolucao({ capital, taxaMensal: taxa, meses, aporte }, 6)) {
        doc += '┃ mês ' + String(p.mes).padStart(3) + ': ' + F.moeda(p.total) + '\n'
    }
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '_Simulação com taxa constante. Rendimento real varia e não é garantido._'
    return reply(doc)
    }
}
