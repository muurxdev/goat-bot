/**
 * Comando .desconto — calcula preço com desconto.
 * Uso: .desconto <preço> <percentual>
 */
module.exports = {
    name: 'desconto',
    aliases: ['promocao', 'calcdesconto'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula o preço final com desconto (ex.: .desconto 200 15)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const preco = parseFloat((args[0] || '').replace(',', '.'))
        const pct = parseFloat((args[1] || '').replace(',', '.'))
        if (isNaN(preco) || isNaN(pct)) return reply('🏷️ *Desconto* — Uso: `.desconto <preço> <percentual>` (ex.: `.desconto 200 15`)')
        const economia = preco * (pct / 100)
        const final = preco - economia
        const f = (n) => 'R$ ' + n.toFixed(2).replace('.', ',')
        return reply(`🏷️ *DESCONTO*\n\n💲 Preço: ${f(preco)}\n📉 Desconto: ${pct}% (${f(economia)})\n✅ *Preço final:* *${f(final)}*`)
    }
}
