/**
 * Comando .pascalcase — Converte texto para PascalCase: .pascalcase <texto>
 */
module.exports = {
    name: "pascalcase",
    aliases: ["pascalcase-cmd","cmd-pascalcase","cmd_pascalcase","alt_pascalcase","atalho_pascalcase","abrev_pascalcase","call_pascalcase","func_pascalcase"],
    category: "dev",
    subcategory: "String",
    description: "Converte texto para PascalCase: .pascalcase <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.pascalcase <texto>`");
            const res = t.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, "");
            return reply(`📐 *PascalCase:*\n\`${res}\``);
        }
};
