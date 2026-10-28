/**
 * Comando .morse — converte texto ↔ código Morse.
 */
const M = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', ' ': '/' }
const R = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, k]))

module.exports = {
    name: 'morse',
    aliases: ['codigomorse', 'morsecode'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Converte texto ↔ código Morse (ex.: .morse SOS ou .morse ... --- ...)',
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => {
        const input = (text || (args || []).join(' ')).trim()
        if (!input) return reply('📡 *Morse* — Uso: `.morse SOS` ou `.morse ... --- ...`')
        if (/^[.\-/ ]+$/.test(input)) {
            const dec = input.trim().split(' ').map(c => R[c] || (c === '/' ? ' ' : '')).join('')
            return reply(`📡 *Decodificado:*\n${dec || '(vazio)'}`)
        }
        const enc = input.toUpperCase().split('').map(c => M[c] || '').filter(Boolean).join(' ')
        return reply(`📡 *Morse:*\n${enc}`)
    }
}
