/**
 * Comando .textb64url — Codifica texto para Base64 URL Safe: .textb64url <texto>
 */
module.exports = {
    name: "textb64url",
    aliases: ["textb64url-cmd","cmd-textb64url","cmd_textb64url","alt_textb64url","atalho_textb64url","abrev_textb64url","call_textb64url","func_textb64url"],
    category: "dev",
    subcategory: "Cifra",
    description: "Codifica texto para Base64 URL Safe: .textb64url <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.textb64url <texto>`");
            const b64 = Buffer.from(t).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            return reply(`🔒 *Base64URL:*\n\`${b64}\``);
        }
};
