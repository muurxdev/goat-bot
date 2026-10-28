/**
 * Comando .taxareal — TAXA REAL DE JUROS
 *
 * Desconta a inflação do rendimento nominal.
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
    name: 'taxareal',
    aliases: ["ganhoreal"],
    category: 'general',
    subcategory: 'Finanças Pessoais',
    description: 'Desconta a inflação do rendimento nominal',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const nominal = F.lerNumero(args[0])
    const infl = F.lerNumero(args[1])
    if (!Number.isFinite(nominal) || !Number.isFinite(infl)) {
        let doc = cab('TAXA REAL DE JUROS', '🧮')
        doc += '📌 Uso: `' + prefix + 'taxareal <rendimento %> <inflação %>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'taxareal 10 4,5`'
        return reply(doc)
    }
    const real = F.taxaReal(nominal, infl)
    let doc = cab('TAXA REAL DE JUROS', '🧮')
    doc += linha('Rendeu (nominal)', F.pct(nominal))
    doc += linha('Inflação', F.pct(infl))
    doc += sep()
    doc += '💰 *Ganho real: ' + F.pct(real) + '*\n\n'
    doc += (real > 0
        ? '✅ Você ganhou poder de compra.'
        : real < 0 ? '❌ Você perdeu poder de compra, apesar do saldo ter subido.' : '➖ Empatou com a inflação.')
    doc += '\n\n⚠️ *O erro comum*\nSubtrair direto daria ' + F.pct(nominal - infl) + '. '
    doc += 'A conta certa é (1 + nominal) ÷ (1 + inflação) − 1, e a diferença cresce com os números.'
    return reply(doc)
    }
}
