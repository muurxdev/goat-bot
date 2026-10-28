/**
 * Comando .binencode — Converte texto para representação binária (8 bits)
 */
module.exports = {
    name: "binencode",
    aliases: ["texto2bin","cmd_binencode","alt_binencode","atalho_binencode","abrev_binencode","call_binencode","func_binencode"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Converte texto para representação binária (8 bits)",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.binencode <texto>`');
            const bin = Array.from(Buffer.from(t, 'utf8')).map(b => b.toString(2).padStart(8, '0')).join(' ');
            return reply(`💾 *BINÁRIO (8-bit):*\n\n\`${bin}\``);
        }
};
