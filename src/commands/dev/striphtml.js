/**
 * Comando .striphtml — Remove tags HTML de um texto: .striphtml <tags>
 */
module.exports = {
    name: "striphtml",
    aliases: ["striphtml-cmd","cmd-striphtml","cmd_striphtml","alt_striphtml","atalho_striphtml","abrev_striphtml","call_striphtml","func_striphtml"],
    category: "dev",
    subcategory: "String",
    description: "Remove tags HTML de um texto: .striphtml <tags>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.striphtml <codigo_html>`");
            const clean = t.replace(/<[^>]*>?/gm, "");
            return reply(`🧹 *Texto sem HTML:*\n${clean}`);
        }
};
