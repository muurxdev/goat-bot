/**
 * Comando .minhareserva — RESERVA DE EMERGÊNCIA
 *
 * Calcula sua reserva pelo perfil de renda.
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
    name: 'minhareserva',
    aliases: ["quantoguardar","reservareal"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Calcula sua reserva pelo perfil de renda',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const gasto = F.lerNumero(args[0])
    const perfil = String(args[1] || '').toLowerCase()
    if (!Number.isFinite(gasto) || gasto <= 0) {
        let doc = cab('RESERVA DE EMERGÊNCIA', '🛟')
        doc += '📌 Uso: `' + prefix + 'minhareserva <gasto mensal essencial> [perfil]`\n\n'
        doc += bloco('👤 PERFIS', Object.entries(F.PERFIS_RESERVA).map(([k, p]) => k + ' — ' + p.nome + ' (' + p.meses + ' meses)'))
        doc += '\n🧮 *Exemplo*\n`' + prefix + 'minhareserva 3500 autonomo`'
        return reply(doc)
    }
    let doc = cab('RESERVA DE EMERGÊNCIA', '🛟')
    doc += linha('Gasto essencial', F.moeda(gasto) + '/mês')
    doc += sep()
    const alvos = F.PERFIS_RESERVA[perfil]
        ? [[perfil, F.PERFIS_RESERVA[perfil]]]
        : Object.entries(F.PERFIS_RESERVA)
    for (const [, p] of alvos) {
        doc += '┃ *' + p.nome + '* — ' + p.meses + ' meses\n'
        doc += '┃    Alvo: ' + F.moeda(gasto * p.meses) + '\n'
        if (alvos.length === 1) doc += '┃    ' + p.porque + '\n'
    }
    doc += '\n🛟 *Onde deixar*\nLiquidez diária e risco baixo. Reserva com carência não é reserva.\n\n'
    doc += '💡 _Ver produtos:_ `' + prefix + 'produtosfinanceiros`'
    return reply(doc)
    }
}
