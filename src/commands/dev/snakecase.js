/**
 * Comando .snakecase — Converte texto para snake_case: .snakecase <texto>
 */
module.exports = {
    name: "snakecase",
    aliases: ["snakecase-cmd","cmd-snakecase","cmd_snakecase","alt_snakecase","atalho_snakecase","abrev_snakecase","call_snakecase","func_snakecase"],
    category: "dev",
    subcategory: "String",
    description: "Converte texto para snake_case: .snakecase <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.snakecase <texto>`");
            const res = t.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
            return reply(`🐍 *snake_case:*\n\`${res}\``);
        }
};
