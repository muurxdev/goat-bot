/**
 * Comando .gorjeta — calcula gorjeta e divide a conta.
 * Uso: .gorjeta <valor> [percentual=10] [pessoas=1]
 */
module.exports = {
    name: 'gorjeta',
    aliases: ['gorjetacalc', 'tip', 'rachaconta'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula a gorjeta e divide a conta (ex.: .gorjeta 120 10 3)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const valor = parseFloat((args[0] || '').replace(',', '.'))
        if (isNaN(valor) || valor <= 0) return reply('💵 *Gorjeta* — Uso: `.gorjeta <valor> [%=10] [pessoas=1]`')
        const pct = parseFloat((args[1] || '10').replace(',', '.')) || 10
        const pessoas = Math.max(1, parseInt(args[2] || '1', 10) || 1)
        const gorjeta = valor * (pct / 100)
        const total = valor + gorjeta
        const porPessoa = total / pessoas
        const f = (n) => 'R$ ' + n.toFixed(2).replace('.', ',')
        return reply(`💵 *CONTA*\n\n🧾 Valor: ${f(valor)}\n💰 Gorjeta (${pct}%): ${f(gorjeta)}\n✅ *Total:* ${f(total)}\n👥 Por pessoa (${pessoas}): *${f(porPessoa)}*`)
    }
}
