/**
 * Comando .mmcmdc — calcula o MMC e o MDC de dois ou mais números.
 */
function mdc(a, b) { while (b) { [a, b] = [b, a % b] } return Math.abs(a) }
function mmc(a, b) { return Math.abs(a * b) / mdc(a, b) }

module.exports = {
    name: 'mmcmdc',
    aliases: ['mmc', 'mdc', 'gcdlcm'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Calcula MMC e MDC de dois ou mais números (ex.: .mmcmdc 12 18)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        const nums = args.map(v => parseInt(v, 10)).filter(v => !isNaN(v) && v !== 0)
        if (nums.length < 2) return reply('🔢 *MMC/MDC* — Uso: `.mmcmdc <n1> <n2> [n3...]` (ex.: `.mmcmdc 12 18`)')
        const gcd = nums.reduce((a, b) => mdc(a, b))
        const lcm = nums.reduce((a, b) => mmc(a, b))
        return reply(`🔢 *${nums.join(', ')}*\n\n🔹 *MDC:* ${gcd}\n🔸 *MMC:* ${lcm}`)
    }
}
