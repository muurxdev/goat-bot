/**
 * Comando .desafiaramigo — Lança uma luva de desafio amigável a outro guerreiro: .desafiaramigo [nome]
 */
module.exports = {
    name: "desafiaramigo",
    aliases: ["desafiaramigo-cmd","cmd-desafiaramigo"],
    category: "general",
    subcategory: "Combate",
    description: "Lança uma luva de desafio amigável a outro guerreiro: .desafiaramigo [nome]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "Guerreiro";
            return reply(`⚔️ *DESAFIO LANÇADO!*\n\nVocê atirou a luva de aço aos pés de *${alvo}*!\n"Encontro você na arena de Torre ao pôr do sol!"`);
        }
};
