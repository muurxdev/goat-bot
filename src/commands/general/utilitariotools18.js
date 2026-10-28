/**
 * Comando .horaextra — HORAS EXTRAS
 *
 * Horas extras a 50% e 100%, com o reflexo no descanso semanal
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
    name: 'horaextra',
    aliases: ["he","extras"],
    category: 'general',
    subcategory: 'Utilidades & Telefonia',
    description: 'Horas extras a 50% e 100%, com o reflexo no descanso semanal',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], text = '', prefix = '.' }) => {
        const partes = (text && text.trim() ? text.trim() : args.join(' ')).split(/\s+/).filter(Boolean)

        const salario = L.lerNumero(partes[0])
        const h50 = L.lerNumero(partes[1]) || 0
        const h100 = L.lerNumero(partes[2]) || 0
        const jornada = L.lerNumero(partes[3]) || L.TABELAS.jornadaMensalPadrao
        if (!Number.isFinite(salario) || salario <= 0 || (!h50 && !h100)) {
            let doc = cab('HORAS EXTRAS', '⏱️')
            doc += '📌 Uso: `' + prefix + 'horaextra <salário> <horas 50%> [horas 100%] [jornada mensal]`\n\n'
            doc += '🧮 *Exemplo*\n`' + prefix + 'horaextra 3000 10 4`\n'
            doc += '_R$ 3.000 de salário, 10 h em dia útil e 4 h em domingo._\n\n'
            doc += '_Jornada padrão: 220 h/mês (44 h semanais)._'
            return reply(doc)
        }
        const r = L.horasExtras({ salario, horas50: h50, horas100: h100, jornadaMensal: jornada })
        let doc = cab('HORAS EXTRAS', '⏱️')
        doc += linha('Salário', L.moeda(salario))
        doc += linha('Jornada mensal', r.jornadaMensal + ' h')
        doc += linha('Hora normal', L.moeda(r.hora))
        doc += sep()
        const itens = []
        if (r.h50) itens.push(r.h50 + ' h a 50% = ' + L.moeda(r.valor50))
        if (r.h100) itens.push(r.h100 + ' h a 100% = ' + L.moeda(r.valor100))
        itens.push('Reflexo no DSR = ' + L.moeda(r.dsr))
        doc += bloco('🧮 A CONTA', itens)
        doc += '\n💵 *Total: ' + L.moeda(r.total) + '*\n\n'
        doc += '🔎 *O que quase ninguém cobra*\nA hora extra repercute no descanso semanal remunerado — já somado acima — e ainda no 13º, nas férias e no FGTS.\n\n'
        doc += '⚖️ _Não pagaram?_ `' + prefix + 'problemahorasnaopagas`'
        return reply(doc)
    }
}
