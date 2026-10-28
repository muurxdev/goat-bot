/**
 * Comando .regradetres — regra de três simples: a está para b, c está para x.
 * Uso: .regradetres a b c  →  x = (b * c) / a
 */
module.exports = {
    name: 'regradetres',
    aliases: ['ruleofthree', 'proporcao'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Regra de três simples (ex.: .regradetres 2 10 5 → 25)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const [a, b, c] = args.slice(0, 3).map(v => parseFloat((v || '').replace(',', '.')))
        if ([a, b, c].some(v => isNaN(v))) return reply('📐 *Regra de 3* — Uso: `.regradetres a b c`\n_Se **a** está para **b**, então **c** está para **x**._')
        if (a === 0) return reply('❌ O primeiro valor não pode ser 0.')
        const x = (b * c) / a
        return reply(`📐 *REGRA DE TRÊS*\n\n${a} → ${b}\n${c} → *${Number.isInteger(x) ? x : x.toFixed(2)}*`)
    }
}
