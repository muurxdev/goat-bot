/**
 * Comando .reservaautonomo — RESERVA — AUTÔNOMO OU PJ
 *
 * Reserva de emergência para autônomo ou pj.
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
    name: 'reservaautonomo',
    aliases: ["emergenciaautonomo"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Reserva de emergência para autônomo ou pj',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const r = F.PERFIS_RESERVA['autonomo']
    const gasto = F.lerNumero(args[0])
    let doc = cab("RESERVA — AUTÔNOMO OU PJ", '🛟')
    doc += linha('Perfil', r.nome)
    doc += linha('Cobertura', r.meses + ' meses')
    doc += sep()
    doc += '🧭 *Por quê*\n' + r.porque + '\n\n'
    if (Number.isFinite(gasto) && gasto > 0) {
        doc += bloco('🎯 SUA META', [
            'Gasto essencial: ' + F.moeda(gasto) + '/mês',
            'Reserva alvo: *' + F.moeda(gasto * r.meses) + '*',
            'Guardando 10% do gasto por mês: ' + Math.ceil(r.meses / 0.1) + ' meses'
        ])
    } else {
        doc += '📌 _Informe seu gasto mensal essencial:_ `' + prefix + 'reservaautonomo 3500`\n'
    }
    doc += '\n_A conta é sobre o gasto essencial, nunca sobre a renda._'
    return reply(doc)
    }
}
