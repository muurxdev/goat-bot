/**
 * Comando .elogiaramigo — Faz um elogio genuíno para levantar a moral: .elogiaramigo [nome]
 */
module.exports = {
    name: "elogiaramigo",
    aliases: ["elogiaramigo-cmd","cmd-elogiaramigo"],
    category: "general",
    subcategory: "Social",
    description: "Faz um elogio genuíno para levantar a moral: .elogiaramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "alguém incrível";
            return reply(`⭐ *ELOGIO RECONHECIDO*\n\n"Você é uma pessoa incrível, *${alvo}*! Sua presença alegra a taverna inteira e seu talento é admirável!"`);
        }
};
