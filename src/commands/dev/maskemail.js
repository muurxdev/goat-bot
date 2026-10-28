/**
 * Comando .maskemail — Mascara um e-mail para exibição pública: .maskemail usuario@exemplo.com
 */
module.exports = {
    name: "maskemail",
    aliases: ["maskemail-cmd","cmd-maskemail","cmd_maskemail","alt_maskemail","atalho_maskemail","abrev_maskemail","call_maskemail","func_maskemail"],
    category: "dev",
    subcategory: "Segurança",
    description: "Mascara um e-mail para exibição pública: .maskemail usuario@exemplo.com",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const email = args[0] || "";
            if (!email.includes("@")) return reply("Uso: `.maskemail <email>`");
            const [user, domain] = email.split("@");
            const visible = user.length > 2 ? user.slice(0, 2) + "*".repeat(user.length - 2) : user + "***";
            return reply(`🛡️ *E-mail Mascarado:* \`${visible}@${domain}\``);
        }
};
