/**
 * Comando .convertertaxa — CONVERTER TAXA
 *
 * Converte taxa entre dia, mês, trimestre, semestre e ano.
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
    name: 'convertertaxa',
    aliases: ["taxaparaano"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Converte taxa entre dia, mês, trimestre, semestre e ano',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const taxa = F.lerNumero(args[0])
    const de = String(args[1] || '').toLowerCase()
    const para = String(args[2] || '').toLowerCase()
    const validos = ['dia', 'mes', 'trimestre', 'semestre', 'ano']
    if (!Number.isFinite(taxa) || !validos.includes(de) || !validos.includes(para)) {
        let doc = cab('CONVERTER TAXA', '🔄')
        doc += '📌 Uso: `' + prefix + 'convertertaxa <taxa> <de> <para>`\n\n'
        doc += bloco('📅 PERÍODOS', validos)
        doc += '\n🧮 *Exemplo*\n`' + prefix + 'convertertaxa 1 mes ano` — 1% ao mês em taxa anual'
        return reply(doc)
    }
    const r = F.converterTaxa(taxa, de, para)
    let doc = cab('CONVERTER TAXA', '🔄')
    doc += linha('Entrada', F.pct(taxa) + ' ao ' + de)
    doc += sep()
    doc += '*' + F.pct(taxa) + ' ao ' + de + ' = ' + F.pct(r, 4) + ' ao ' + para + '*\n\n'
    if (de === 'mes' && para === 'ano') {
        doc += '⚠️ _Multiplicar por 12 daria ' + F.pct(taxa * 12) + ' — errado. Juros compõem._'
    } else {
        doc += '_A conversão é exponencial, não proporcional: juros rendem sobre juros._'
    }
    return reply(doc)
    }
}
