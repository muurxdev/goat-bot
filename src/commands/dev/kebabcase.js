/**
 * Comando .kebabcase — Converte texto para kebab-case: .kebabcase <texto>
 */
module.exports = {
    name: "kebabcase",
    aliases: ["kebabcase-cmd","cmd-kebabcase","cmd_kebabcase","alt_kebabcase","atalho_kebabcase","abrev_kebabcase","call_kebabcase","func_kebabcase"],
    category: "dev",
    subcategory: "String",
    description: "Converte texto para kebab-case: .kebabcase <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.kebabcase <texto>`");
            const res = t.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return reply(`🍢 *kebab-case:*\n\`${res}\``);
        }
};
