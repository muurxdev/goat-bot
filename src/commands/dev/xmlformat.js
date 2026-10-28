/**
 * Comando .xmlformat — Valida e indenta tags XML básicas: .xmlformat <xml>
 */
module.exports = {
    name: "xmlformat",
    aliases: ["xmlformat-cmd","cmd-xmlformat","cmd_xmlformat","alt_xmlformat","atalho_xmlformat","abrev_xmlformat","call_xmlformat","func_xmlformat"],
    category: "dev",
    subcategory: "Dev",
    description: "Valida e indenta tags XML básicas: .xmlformat <xml>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const raw = args.join(" ");
            if (!raw) return reply("Uso: `.xmlformat <xml>`");
            const formatted = raw.replace(/>\s*</g, ">\n<");
            return reply(`📄 *XML Visualizador:*\n\`\`\`xml\n${formatted}\n\`\`\``);
        }
};
