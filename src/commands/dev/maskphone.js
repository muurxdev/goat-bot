/**
 * Comando .maskphone — Mascara número de telefone: .maskphone 11987654321
 */
module.exports = {
    name: "maskphone",
    aliases: ["maskphone-cmd","cmd-maskphone","cmd_maskphone","alt_maskphone","atalho_maskphone","abrev_maskphone","call_maskphone","func_maskphone"],
    category: "dev",
    subcategory: "Segurança",
    description: "Mascara número de telefone: .maskphone 11987654321",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const p = (args[0] || "").replace(/\D/g, "");
            if (p.length < 10) return reply("Uso: `.maskphone <numero>`");
            const masked = p.slice(0, 4) + "****" + p.slice(-2);
            return reply(`🛡️ *Telefone Mascarado:* \`${masked}\``);
        }
};
