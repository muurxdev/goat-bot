/**
 * Comando .htmldecode — Converte entidades HTML de volta para caracteres puros
 */
module.exports = {
    name: "htmldecode",
    aliases: ["unescapehtml","cmd_htmldecode","alt_htmldecode","atalho_htmldecode","abrev_htmldecode","call_htmldecode","func_htmldecode"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Converte entidades HTML de volta para caracteres puros",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim();
            if (!t) return reply('📌 Uso: `.htmldecode <código>`');
            const unesc = t.replace(/&amp;/g, '&')
                           .replace(/&lt;/g, '<')
                           .replace(/&gt;/g, '>')
                           .replace(/&quot;/g, '"')
                           .replace(/&#039;/g, "'")
                           .replace(/&nbsp;/g, ' ');
            return reply(`🏷️ *HTML UNESCAPED:*\n\n${unesc}`);
        }
};
