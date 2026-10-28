/**
 * Comando .romano — converte número arábico ↔ algarismo romano.
 */
const ui = require('../../utils/ui')

const MAP = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
]

function toRoman(n) {
    let r = ''
    for (const [v, s] of MAP) { while (n >= v) { r += s; n -= v } }
    return r
}
function fromRoman(s) {
    const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
    let total = 0, prev = 0
    for (let i = s.length - 1; i >= 0; i--) {
        const v = val[s[i]]
        if (!v) return null
        if (v < prev) total -= v; else { total += v; prev = v }
    }
    return toRoman(total) === s ? total : null // valida forma canônica
}

module.exports = {
    name: 'romano',
    aliases: ['roman', 'numeroromano', 'algarismoromano'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Converte número em algarismo romano e o contrário',
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => {
        const input = (text || (args || []).join(' ')).trim().toUpperCase()
        if (!input) return reply('🔢 *Romano* — Uso: `.romano 2024` ou `.romano MMXXIV`')

        if (/^[0-9]+$/.test(input)) {
            const n = parseInt(input, 10)
            if (n < 1 || n > 3999) return reply('❌ Informe um número entre *1 e 3999*.')
            return reply(ui.screen({ title: '🔢 *ROMANO* 🔢', intro: `*${n}* = *${toRoman(n)}*`, hint: '_Também converto de romano p/ número._' }))
        }
        if (/^[IVXLCDM]+$/.test(input)) {
            const n = fromRoman(input)
            if (!n) return reply('❌ Algarismo romano inválido.')
            return reply(ui.screen({ title: '🔢 *ROMANO* 🔢', intro: `*${input}* = *${n}*`, hint: '_Também converto de número p/ romano._' }))
        }
        return reply('❌ Entrada inválida. Use só dígitos (1-3999) ou letras romanas (I V X L C D M).')
    }
}
