/**
 * Comando .castelocentral — Visita o Castelo Real Central: .castelocentral
 */
module.exports = {
    name: "castelocentral",
    aliases: ["castelocentral-cmd","cmd-castelocentral"],
    category: "rpg",
    subcategory: "Local",
    description: "Visita o Castelo Real Central: .castelocentral",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏰 *CASTELO REAL CENTRAL*\n\n▫️ Assento do Rei Bartra Central (Vision)\n▫️ Centro de comando dos Cavaleiros Sagrados e quartel dos Sete Traços Capitais.`);
        }
};
