/**
 * Comando .hexencode — Converte texto comum para representação Hexadecimal
 */
module.exports = {
    name: "hexencode",
    aliases: ["texto2hex","cmd_hexencode","alt_hexencode","atalho_hexencode","abrev_hexencode","call_hexencode","func_hexencode"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Converte texto comum para representação Hexadecimal",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.hexencode <texto>`');
            const hex = Buffer.from(t, 'utf8').toString('hex');
            return reply(`🔢 *HEXADECIMAL:*\n\n\`${hex}\``);
        }
};
