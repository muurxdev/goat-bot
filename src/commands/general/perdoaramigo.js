/**
 * Comando .perdoaramigo — Concede o perdão de coração aberto: .perdoaramigo [nome]
 */
module.exports = {
    name: "perdoaramigo",
    aliases: ["perdoaramigo-cmd","cmd-perdoaramigo"],
    category: "general",
    subcategory: "Social",
    description: "Concede o perdão de coração aberto: .perdoaramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu parceiro";
            return reply(`🕊️ *PERDÃO CONCEDIDO*\n\nVocê estendeu a mão para *${alvo}*: "Águas passadas não movem moinhos. Estamos em paz de novo!"`);
        }
};
