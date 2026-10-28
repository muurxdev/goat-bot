/**
 * Comando .htmlencode — Converte caracteres especiais (&, <, >, ", ') para entidades HTML seguras
 */
module.exports = {
    name: "htmlencode",
    aliases: ["escapehtml","cmd_htmlencode","alt_htmlencode","atalho_htmlencode","abrev_htmlencode","call_htmlencode","func_htmlencode"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Converte caracteres especiais (&, <, >, \", ') para entidades HTML seguras",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.htmlencode <código>`');
            const esc = t.replace(/&/g, '&amp;')
                         .replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')
                         .replace(/"/g, '&quot;')
                         .replace(/'/g, '&#039;');
            return reply(`🏷️ *HTML ESCAPED:*\n\n\`\`\`html\n${esc}\n\`\`\``);
        }
};
