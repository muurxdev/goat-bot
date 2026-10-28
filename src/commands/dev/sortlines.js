/**
 * Comando .sortlines — Ordena itens ou palavras em ordem alfabética: .sortlines item1, item2, item3
 */
module.exports = {
    name: "sortlines",
    aliases: ["sortlines-cmd","cmd-sortlines","cmd_sortlines","alt_sortlines","atalho_sortlines","abrev_sortlines","call_sortlines","func_sortlines"],
    category: "dev",
    subcategory: "String",
    description: "Ordena itens ou palavras em ordem alfabética: .sortlines item1, item2, item3",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.sortlines item1, item2, item3`");
            const items = t.includes(",") ? t.split(",") : t.split(/\s+/);
            const sorted = items.map(s => s.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b));
            return reply(`🔤 *Ordenado alfabeticamente:*\n${sorted.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}`);
        }
};
