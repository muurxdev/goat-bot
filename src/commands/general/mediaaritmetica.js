/**
 * Comando .mediaaritmetica — média, soma, mín, máx de uma lista de números.
 */
module.exports = {
    name: 'mediaaritmetica',
    aliases: ['medianumeros', 'average', 'calcmedia'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Média, soma, mín e máx de números (ex.: .mediaaritmetica 7 8 9 10)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const nums = args.map(v => parseFloat((v || '').replace(',', '.'))).filter(v => !isNaN(v))
        if (nums.length < 1) return reply('📊 *Média* — Uso: `.mediaaritmetica 7 8 9 10`')
        const soma = nums.reduce((a, b) => a + b, 0)
        const media = soma / nums.length
        const fmt = (n) => Number.isInteger(n) ? n : n.toFixed(2)
        return reply(`📊 *ESTATÍSTICA* (${nums.length} valores)\n\n➕ Soma: *${fmt(soma)}*\n📈 Média: *${fmt(media)}*\n🔺 Máx: *${fmt(Math.max(...nums))}*\n🔻 Mín: *${fmt(Math.min(...nums))}*`)
    }
}
