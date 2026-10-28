/**
 * Comando .darcafune — Faz um cafuné relaxante na cabeça de alguém: .darcafune [nome]
 */
module.exports = {
    name: "darcafune",
    aliases: ["darcafune-cmd","cmd-darcafune"],
    category: "general",
    subcategory: "Interação",
    description: "Faz um cafuné relaxante na cabeça de alguém: .darcafune [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu companheiro";
            return reply(`💆 *CAFUNÉ RELAXANTE*\n\nVocê fez um cafuné carinhoso nos cabelos de *${alvo}*, espantando todo o estresse das batalhas!`);
        }
};
