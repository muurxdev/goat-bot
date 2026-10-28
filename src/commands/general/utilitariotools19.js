/**
 * Comando .ferias — FÉRIAS
 *
 * Férias com 1/3, descontos e abono pecuniário
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
    name: 'ferias',
    aliases: ["calcularferias"],
    category: 'general',
    subcategory: 'Utilidades & Telefonia',
    description: 'Férias com 1/3, descontos e abono pecuniário',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)

        const salario = L.lerNumero(partes[0])
        const dias = parseInt(partes[1], 10) || 30
        const vender = /vender|abono/i.test(partes.join(' '))
        const dep = parseInt(partes.find((p, i) => i > 1 && /^\d{1,2}$/.test(p)) || '0', 10) || 0
        if (!Number.isFinite(salario) || salario <= 0) {
            let doc = cab('FÉRIAS', '🏖️')
            doc += '📌 Uso: `' + prefix + 'ferias <salário> [dias] [vender]`\n\n'
            doc += '🧮 *Exemplos*\n`' + prefix + 'ferias 3000`\n`' + prefix + 'ferias 3000 20 vender`\n\n'
            doc += '_"vender" simula o abono pecuniário: até 1/3 das férias em dinheiro._'
            return reply(doc)
        }
        const r = L.ferias({ salario, dias, abono: vender, dependentes: dep })
        let doc = cab('FÉRIAS', '🏖️')
        doc += linha('Salário', L.moeda(salario))
        doc += linha('Dias gozados', String(r.dias))
        doc += sep()
        const itens = [
            'Férias (' + r.dias + ' dias): ' + L.moeda(r.gozadas),
            '+ 1/3 constitucional: ' + L.moeda(r.terco),
            'Bruto tributável: ' + L.moeda(r.brutoTributavel)
        ]
        if (r.diasAbono) {
            itens.push('Abono de ' + r.diasAbono + ' dias: ' + L.moeda(r.valorAbono))
            itens.push('+ 1/3 do abono: ' + L.moeda(r.tercoAbono))
        }
        doc += bloco('🧮 A CONTA', itens)
        doc += bloco('📉 DESCONTOS', [
            'INSS: ' + L.moeda(r.inss.valor),
            'IRRF: ' + L.moeda(r.irrf.valor) + (r.irrf.isento ? ' (isento)' : '')
        ])
        doc += '\n💵 *Líquido: ' + L.moeda(r.liquido) + '*\n\n'
        if (r.diasAbono) doc += '✅ _O abono pecuniário é isento de INSS e IRRF — por isso entra inteiro no líquido._\n'
        doc += '⚠️ _Férias não concedidas em até 12 meses são pagas em dobro:_ `' + prefix + 'direitoferias`'
        return reply(doc)
    }
}
