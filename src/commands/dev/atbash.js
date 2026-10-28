/**
 * Comando .atbash — Codifica ou decodifica um texto usando a cifra Atbash (A↔Z, B↔Y)
 */
module.exports = {
    name: "atbash",
    aliases: ["cifraatbash","cmd_atbash","alt_atbash","atalho_atbash","abrev_atbash","call_atbash","func_atbash"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Codifica ou decodifica um texto usando a cifra Atbash (A↔Z, B↔Y)",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.atbash <texto>`');
            const out = t.replace(/[a-zA-Z]/g, c => {
                const isUpper = c <= 'Z';
                const base = isUpper ? 65 : 97;
                return String.fromCharCode((25 - (c.charCodeAt(0) - base)) + base);
            });
            return reply(`📜 *CIFRA ATBASH:*\n\n${out}`);
        }
};
