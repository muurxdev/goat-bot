/**
 * Comando .salarioliquido — SALÁRIO LÍQUIDO
 *
 * Calcula o líquido descontando INSS e IRRF.
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
    name: 'salarioliquido',
    aliases: ["liquido","holerite"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Calcula o líquido descontando INSS e IRRF',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const bruto = L.lerNumero(args[0])
    const dep = parseInt(args[1], 10) || 0
    const outros = L.lerNumero(args[2]) || 0
    if (!Number.isFinite(bruto) || bruto <= 0) {
        let doc = cab('SALÁRIO LÍQUIDO', '💰')
        doc += '📌 Uso: `' + prefix + 'salarioliquido <bruto> [dependentes] [outros descontos]`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'salarioliquido 3500 2`\n\n'
        doc += '_Tabelas de ' + L.TABELAS.vigencia + '._'
        return reply(doc)
    }
    const r = L.salarioLiquido({ bruto, dependentes: dep, outrosDescontos: outros })
    let doc = cab('SALÁRIO LÍQUIDO', '💰')
    doc += linha('Bruto', L.moeda(r.bruto))
    if (dep) doc += linha('Dependentes', String(dep))
    doc += sep()
    doc += '╭━〔 📉 DESCONTOS 〕━⬣\n'
    doc += '┃ INSS: ' + L.moeda(r.inss.valor) + '  _(' + L.pct(r.inss.aliquotaEfetiva) + ' efetivo)_\n'
    for (const f of r.inss.detalhe) doc += '┃    ' + L.pct(f.aliquota, 1) + ' sobre ' + L.moeda(f.sobre) + ' = ' + L.moeda(f.valor) + '\n'
    doc += '┃ IRRF: ' + L.moeda(r.irrf.valor) + (r.irrf.isento ? '  _(isento)_' : '  _(modelo ' + r.irrf.modelo + ')_') + '\n'
    if (r.outros) doc += '┃ Outros: ' + L.moeda(r.outros) + '\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
    doc += '💵 *Líquido: ' + L.moeda(r.liquido) + '*\n'
    doc += barra(r.liquido / r.bruto) + ' do bruto\n\n'
    if (!r.irrf.isento) {
        doc += '🔎 *Por que esse modelo de IR*\nA folha usa o que descontar menos: completo daria ' + L.moeda(r.irrf.completo) + ' e simplificado ' + L.moeda(r.irrf.simplificado) + '.\n\n'
    }
    doc += '_Tabelas de ' + L.TABELAS.vigencia + '. Não inclui vale-transporte, plano de saúde nem adiantamento._'
    return reply(doc)
    }
}
