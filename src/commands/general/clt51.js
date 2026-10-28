/**
 * Comando .tabelasclt — TABELAS VIGENTES
 *
 * INSS, IRRF, salário mínimo e demais parâmetros.
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
    name: 'tabelasclt',
    aliases: ["tabelainss"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'INSS, IRRF, salário mínimo e demais parâmetros',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const T = L.TABELAS
    let doc = cab('TABELAS VIGENTES', '📊')
    doc += linha('Vigência', T.vigencia)
    doc += linha('Salário mínimo', L.moeda(T.salarioMinimo))
    doc += sep()
    doc += '╭━〔 🏛️ INSS (progressivo) 〕━⬣\n'
    let ant = 0
    for (const f of T.inss.faixas) {
        doc += '┃ ' + L.moeda(ant + 0.01) + ' a ' + L.moeda(f.ate) + ' → ' + L.pct(f.aliquota, 1) + '\n'
        ant = f.ate
    }
    doc += '┃ Teto de contribuição: ' + L.moeda(T.inss.teto) + '\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
    doc += '╭━〔 🧾 IRRF (mensal) 〕━⬣\n'
    let ant2 = 0
    for (const f of T.irrf.faixas) {
        const ate = f.ate === Infinity ? 'acima disso' : 'até ' + L.moeda(f.ate)
        doc += '┃ ' + ate + ' → ' + (f.aliquota ? L.pct(f.aliquota, 1) + ', deduz ' + L.moeda(f.deduzir) : 'isento') + '\n'
        ant2 = f.ate
    }
    doc += '┃ Por dependente: ' + L.moeda(T.irrf.porDependente) + '\n'
    doc += '┃ Desconto simplificado: ' + L.moeda(T.irrf.descontoSimplificado) + '\n'
    doc += '╰━━━━━━━━━━━━━━━━━━⬣\n'
    doc += bloco('⚙️ OUTROS PARÂMETROS', [
        'FGTS: ' + T.fgtsPercentual + '% do salário',
        'Jornada padrão: ' + T.jornadaMensalPadrao + ' h/mês (44 h semanais)',
        'Adicional noturno urbano: ' + T.adicionalNoturnoPct + '%',
        'Teto de desconto do vale-transporte: ' + T.limiteValeTransportePct + '%'
    ])
    doc += '\n_Todo comando de cálculo usa exatamente estes números e imprime a vigência junto do resultado._'
    return reply(doc)
    }
}
