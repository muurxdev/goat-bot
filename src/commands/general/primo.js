/**
 * Comando .primo — verifica se um número é primo (e mostra os divisores se não for).
 */
module.exports = {
    name: 'primo',
    aliases: ['ehprimo', 'isprime', 'numeroprimo'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Verifica se um número é primo (ex.: .primo 97)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const n = parseInt(args[0], 10)
        if (isNaN(n) || n < 1) return reply('🔢 *Primo* — Uso: `.primo <número>` (inteiro ≥ 1)')
        if (n > 1e15) return reply('❌ Número grande demais.')
        if (n === 1) return reply('🔢 *1* não é primo nem composto.')
        let primo = true, divisor = null
        for (let i = 2; i <= Math.sqrt(n); i++) { if (n % i === 0) { primo = false; divisor = i; break } }
        return reply(primo
            ? `✅ *${n}* é um número *PRIMO*!`
            : `❌ *${n}* NÃO é primo (divisível por ${divisor}).`)
    }
}
