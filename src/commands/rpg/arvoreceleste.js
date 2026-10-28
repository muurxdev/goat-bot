/**
 * Comando .arvoreceleste — Consulta a árvore sagrada do mundo celestial: .arvoreceleste
 */
module.exports = {
    name: "arvoreceleste",
    aliases: ["arvoreceleste-cmd","cmd-arvoreceleste"],
    category: "rpg",
    subcategory: "Lore",
    description: "Consulta a árvore sagrada do mundo celestial: .arvoreceleste",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🌳 *A GRANDE ÁRVORE SAGRADA*\n\n▫️ Entidade primordial que escolhe e coroa cada Rei das Fadas com a sua semente mágica.\n▫️ Fornece a madeira sagrada que se transforma na lança mágica Espiritual.`);
        }
};
