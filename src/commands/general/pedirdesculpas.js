/**
 * Comando .pedirdesculpas — Pede desculpas sinceras a um amigo ou membro: .pedirdesculpas [nome]
 */
module.exports = {
    name: "pedirdesculpas",
    aliases: ["pedirdesculpas-cmd","cmd-pedirdesculpas"],
    category: "general",
    subcategory: "Social",
    description: "Pede desculpas sinceras a um amigo ou membro: .pedirdesculpas [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu companheiro";
            return reply(`🙏 *PEDIDO DE DESCULPAS*\n\nVocê olhou nos olhos de *${alvo}* e disse com sinceridade: "Perdão se pisei na bola. Nossa amizade vale mais que qualquer desentendimento."`);
        }
};
