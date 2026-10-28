/**
 * Comando .inss — INSS
 *
 * Desconto do INSS faixa a faixa, com alíquota efetiva
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
    name: 'inss',
    aliases: ["descontoinss"],
    category: 'general',
    subcategory: 'Utilidades & Telefonia',
    description: 'Desconto do INSS faixa a faixa, com alíquota efetiva',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)

        const bruto = L.lerNumero(partes[0])
        if (!Number.isFinite(bruto) || bruto <= 0) {
            return reply(cab('INSS', '🏛️') + '📌 Uso: `' + prefix + 'inss <salário bruto>`\n\n🧮 `' + prefix + 'inss 3500`')
        }
        const r = L.calcularInss(bruto)
        let doc = cab('INSS', '🏛️')
        doc += linha('Bruto', L.moeda(bruto))
        doc += sep()
        doc += bloco('📊 FAIXAS (progressivo)', r.detalhe.map(f =>
            L.pct(f.aliquota, 1) + ' sobre ' + L.moeda(f.sobre) + ' = ' + L.moeda(f.valor)))
        doc += '\n💸 *Desconto: ' + L.moeda(r.valor) + '*  _(' + L.pct(r.aliquotaEfetiva) + ' efetivo)_\n'
        doc += '💰 *Sobra do bruto:* ' + L.moeda(bruto - r.valor) + '\n\n'
        if (r.noTeto) doc += '⚠️ _Acima do teto de ' + L.moeda(L.TABELAS.inss.teto) + ': o desconto para de crescer aí._\n'
        doc += '_Tabela de ' + L.TABELAS.vigencia + '. Falta o IRRF:_ `' + prefix + 'salarioliquido ' + Math.round(bruto) + '`'
        return reply(doc)
    }
}
