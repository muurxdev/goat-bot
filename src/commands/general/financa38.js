/**
 * Comando .tempoobjetivo — QUANDO EU CHEGO LÁ
 *
 * Calcula em quantos meses você alcança um valor.
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
    name: 'tempoobjetivo',
    aliases: ["quandochego"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Calcula em quantos meses você alcança um valor',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const objetivo = F.lerNumero(args[0])
    const aporte = F.lerNumero(args[1])
    const taxa = F.lerNumero(args[2]) || 0
    const capital = F.lerNumero(args[3]) || 0
    if (!Number.isFinite(objetivo) || !Number.isFinite(aporte)) {
        let doc = cab('QUANDO EU CHEGO LÁ', '🎯')
        doc += '📌 Uso: `' + prefix + 'tempoobjetivo <meta> <aporte mensal> [taxa % ao mês] [já tenho]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'tempoobjetivo 100000 1000 0,8 5000`'
        return reply(doc)
    }
    const r = F.tempoAteObjetivo({ objetivo, capital, aporte, taxaMensal: taxa })
    let doc = cab('QUANDO EU CHEGO LÁ', '🎯')
    doc += linha('Meta', F.moeda(objetivo))
    doc += linha('Já tenho', F.moeda(capital))
    doc += linha('Aporte', F.moeda(aporte) + '/mês')
    doc += linha('Rendimento', F.pct(taxa) + ' ao mês')
    doc += sep()
    if (!r.alcancavel) return reply(doc + '❌ Não dá para chegar: ' + r.motivo + '.')
    if (r.meses === 0) return reply(doc + '🎉 *Você já alcançou a meta.*')
    const anos = Math.floor(r.meses / 12), resto = r.meses % 12
    doc += '⏳ *' + r.meses + ' meses*'
    if (anos) doc += ' — ' + anos + (anos === 1 ? ' ano' : ' anos') + (resto ? ' e ' + resto + (resto === 1 ? ' mês' : ' meses') : '')
    doc += '\n\n'
    doc += bloco('📊 NA CHEGADA', [
        'Saldo: ' + F.moeda(r.saldoFinal),
        'Você depositou: ' + F.moeda(r.investido),
        'Os juros trouxeram: ' + F.moeda(r.saldoFinal - r.investido)
    ])
    const d = new Date(); d.setMonth(d.getMonth() + r.meses)
    doc += '\n📅 _Nesse ritmo, você chega em ' + d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) + '._'
    return reply(doc)
    }
}
