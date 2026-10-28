/**
 * Comando .trimspaces — Remove espaços excessivos e duplos: .trimspaces <texto>
 */
module.exports = {
    name: "trimspaces",
    aliases: ["trimspaces-cmd","cmd-trimspaces","cmd_trimspaces","alt_trimspaces","atalho_trimspaces","abrev_trimspaces","call_trimspaces","func_trimspaces"],
    category: "dev",
    subcategory: "String",
    description: "Remove espaços excessivos e duplos: .trimspaces <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.trimspaces <texto>`");
            return reply(`🧹 *Texto limpo:*\n${t.trim().replace(/\s+/g, " ")}`);
        }
};
