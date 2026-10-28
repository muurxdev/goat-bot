/**
 * Comando .fibonacci — mostra os N primeiros termos da sequência de Fibonacci.
 */
module.exports = {
    name: 'fibonacci',
    aliases: ['fib', 'sequenciafib'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Mostra os N primeiros termos de Fibonacci (ex.: .fibonacci 12)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const n = parseInt(args[0], 10)
        if (isNaN(n) || n < 1) return reply('🔢 *Fibonacci* — Uso: `.fibonacci <quantidade>` (1 a 100)')
        const q = Math.min(n, 100)
        const seq = [0n, 1n]
        for (let i = 2; i < q; i++) seq.push(seq[i - 1] + seq[i - 2])
        return reply(`🔢 *FIBONACCI (${q} termos)*\n\n${seq.slice(0, q).map(x => x.toString()).join(', ')}`)
    }
}
