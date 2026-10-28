/**
 * Comando .fatorial — calcula n! (usa BigInt para não estourar).
 */
module.exports = {
    name: 'fatorial',
    aliases: ['factorial', 'fat'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula o fatorial de um número (ex.: .fatorial 10)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const n = parseInt(args[0], 10)
        if (isNaN(n) || n < 0) return reply('🔢 *Fatorial* — Uso: `.fatorial <número>` (inteiro ≥ 0)')
        if (n > 1000) return reply('❌ Número grande demais (máx. 1000).')
        let r = 1n
        for (let i = 2n; i <= BigInt(n); i++) r *= i
        const s = r.toString()
        return reply(`🔢 *${n}! =*\n${s.length > 500 ? s.slice(0, 500) + '… (' + s.length + ' dígitos)' : s}`)
    }
}
