/**
 * Comando .adicionalnoturno — ADICIONAL NOTURNO
 *
 * Calcula o adicional noturno e o ganho da hora reduzida.
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
    name: 'adicionalnoturno',
    aliases: ["noturno"],
    category: 'general',
    subcategory: 'Trabalho e CLT',
    description: 'Calcula o adicional noturno e o ganho da hora reduzida',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const salario = L.lerNumero(args[0])
    const horas = L.lerNumero(args[1])
    if (!Number.isFinite(salario) || !Number.isFinite(horas) || salario <= 0) {
        let doc = cab('ADICIONAL NOTURNO', '🌙')
        doc += '📌 Uso: `' + prefix + 'adicionalnoturno <salário> <horas noturnas no mês>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'adicionalnoturno 3000 60`\n\n'
        doc += '_Urbano: das 22h às 5h, adicional de 20%._'
        return reply(doc)
    }
    const r = L.adicionalNoturno({ salario, horasNoturnas: horas })
    let doc = cab('ADICIONAL NOTURNO', '🌙')
    doc += linha('Hora normal', L.moeda(r.hora))
    doc += linha('Horas noturnas', r.horas + ' h de relógio')
    doc += sep()
    doc += bloco('🧮 A CONTA', [
        'Adicional de 20%: ' + L.moeda(r.adicional),
        'Hora reduzida (52min30s): ' + r.horas + ' h contam como ' + r.horasFicticias + ' h',
        'Ganho pela redução: ' + L.moeda(r.ganhoReducao)
    ])
    doc += '\n💵 *Total: ' + L.moeda(r.total) + '*\n\n'
    doc += '🔎 *A parte esquecida*\nA hora noturna vale 52 minutos e 30 segundos. Sete horas de relógio das 22h às 5h contam como oito horas de trabalho — e muita folha paga só o adicional de 20%, ignorando isso.'
    return reply(doc)
    }
}
