/**
 * Comando .dueloversos — Duelo de rimas entre os clientes do Javali: .dueloversos
 */
module.exports = {
    name: "dueloversos",
    aliases: ["dueloversos-cmd","cmd-dueloversos"],
    category: "fun",
    subcategory: "Humor",
    description: "Duelo de rimas entre os clientes do Javali: .dueloversos",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🎤 *BATALHA DA TAVERNA*\n\n\"Na colina do leão ou no fogo do dragão,\nQuem não paga a comanda vai lavar prato no chão!\" 🧼🍽️");
        }
};
