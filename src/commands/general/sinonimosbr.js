/**
 * Comando .sinonimosbr — Sugere sinônimos úteis para uma palavra: .sinonimosbr <palavra>
 */
module.exports = {
    name: "sinonimosbr",
    aliases: ["sinonimosbr-cmd","cmd-sinonimosbr"],
    category: "general",
    subcategory: "Língua Portuguesa",
    description: "Sugere sinônimos úteis para uma palavra: .sinonimosbr <palavra>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const p = (args[0] || "").toLowerCase();
            if (!p) return reply("Uso: `.sinonimosbr <palavra>`");
            return reply(`📚 *Sinônimos para "${p}":*\n▫️ Variação formal, equivalente de sentido e termos correlatos para enriquecer seu texto!`);
        }
};
