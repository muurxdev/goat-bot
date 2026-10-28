/**
 * Comando .sanitizefilename — Sanitiza string para nome de arquivo seguro: .sanitizefilename <nome>
 */
module.exports = {
    name: "sanitizefilename",
    aliases: ["sanitizefilename-cmd","cmd-sanitizefilename","cmd_sanitizefilename","alt_sanitizefilename","atalho_sanitizefilename","abrev_sanitizefilename","call_sanitizefilename","func_sanitizefilename"],
    category: "dev",
    subcategory: "Dev",
    description: "Sanitiza string para nome de arquivo seguro: .sanitizefilename <nome>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.sanitizefilename <nome>`");
            const clean = t.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
            return reply(`📁 *Nome de Arquivo Seguro:*\n\`${clean}\``);
        }
};
