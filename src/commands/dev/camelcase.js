/**
 * Comando .camelcase — Converte texto para camelCase: .camelcase <texto>
 */
module.exports = {
    name: "camelcase",
    aliases: ["camelcase-cmd","cmd-camelcase","cmd_camelcase","alt_camelcase","atalho_camelcase","abrev_camelcase","call_camelcase","func_camelcase"],
    category: "dev",
    subcategory: "String",
    description: "Converte texto para camelCase: .camelcase <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.camelcase <texto>`");
            const res = t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
            return reply(`🐫 *camelCase:*\n\`${res}\``);
        }
};
