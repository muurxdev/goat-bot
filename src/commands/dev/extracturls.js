/**
 * Comando .extracturls — Extrai todos os links/URLs de um texto: .extracturls <texto>
 */
module.exports = {
    name: "extracturls",
    aliases: ["extracturls-cmd","cmd-extracturls","cmd_extracturls","alt_extracturls","atalho_extracturls","abrev_extracturls","call_extracturls","func_extracturls"],
    category: "dev",
    subcategory: "Regex",
    description: "Extrai todos os links/URLs de um texto: .extracturls <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.extracturls <texto>`");
            const urls = t.match(/https?:\/\/[^\s]+/g) || [];
            if (!urls.length) return reply("❌ Nenhuma URL encontrada no texto.");
            return reply(`🔗 *URLs encontradas (${urls.length}):*\n${urls.join("\n")}`);
        }
};
