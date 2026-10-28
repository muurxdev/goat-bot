/**
 * Comando .desmorse — Decodifica uma mensagem em Código Morse para texto
 */
module.exports = {
    name: "desmorse",
    aliases: ["decodermorse","cmd_desmorse","alt_desmorse","atalho_desmorse","abrev_desmorse","call_desmorse","func_desmorse"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Decodifica uma mensagem em Código Morse para texto",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.desmorse <código morse>` (separe letras por espaço e palavras por /)');
            const morseMap = {
                '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
                '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
                '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
                '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
                '--.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
                '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
                '---..': '8', '----.': '9', '/': ' '
            };
            const out = t.split(/\s+/).map(code => morseMap[code] || '?').join('');
            return reply(`📻 *TEXTO DECODIFICADO:*\n\n${out}`);
        }
};
