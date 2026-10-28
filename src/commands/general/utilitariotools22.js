/**
 * Comando .irpf — IMPOSTO DE RENDA NA FONTE
 *
 * IRRF do mês comparando o modelo completo com o desconto simplificado
 * A conta vive em services/laborService; aqui só a apresentação.
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

module.exports = {
    name: 'irpf',
    aliases: ["imposto","descontoir"],
    category: 'general',
    subcategory: 'Utilidades & Telefonia',
    description: 'IRRF do mês comparando o modelo completo com o desconto simplificado',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)

        const bruto = L.lerNumero(partes[0])
        const dep = parseInt(partes[1], 10) || 0
        if (!Number.isFinite(bruto) || bruto <= 0) {
            let doc = cab('IMPOSTO DE RENDA NA FONTE', '🧾')
            doc += '📌 Uso: `' + prefix + 'irpf <salário bruto> [dependentes]`\n\n'
            doc += '🧮 `' + prefix + 'irpf 4500 1`\n\n'
            doc += '_O IRRF incide sobre o bruto menos o INSS, não sobre o bruto._'
            return reply(doc)
        }
        const inss = L.calcularInss(bruto)
        const r = L.calcularIrrf(bruto, inss.valor, dep)
        let doc = cab('IMPOSTO DE RENDA NA FONTE', '🧾')
        doc += linha('Bruto', L.moeda(bruto))
        doc += linha('INSS descontado', L.moeda(inss.valor))
        if (dep) doc += linha('Dependentes', dep + ' × ' + L.moeda(L.TABELAS.irrf.porDependente))
        doc += sep()
        if (r.isento) {
            doc += '✅ *Isento de IRRF*\n\n'
            doc += 'A base de cálculo (' + L.moeda(r.base) + ') ficou dentro da faixa de isenção.\n\n'
        } else {
            doc += bloco('🧮 A CONTA', [
                'Base de cálculo: ' + L.moeda(r.base),
                'Alíquota: ' + L.pct(r.aliquota, 1),
                'Parcela a deduzir: ' + L.moeda(r.deduzir),
                'Modelo usado: ' + r.modelo
            ])
            doc += '\n💸 *Imposto: ' + L.moeda(r.valor) + '*\n\n'
        }
        doc += '🔎 *Por que esse modelo*\nA folha aplica o que descontar menos. Aqui o completo daria ' + L.moeda(r.completo) + ' e o simplificado ' + L.moeda(r.simplificado) + '.\n\n'
        doc += '_Tabela de ' + L.TABELAS.vigencia + '. Líquido completo:_ `' + prefix + 'salarioliquido ' + Math.round(bruto) + (dep ? ' ' + dep : '') + '`'
        return reply(doc)
    }
}
