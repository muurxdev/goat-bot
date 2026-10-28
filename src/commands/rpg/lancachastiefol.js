/**
 * Comando .lancachastiefol — História e materiais da Lança Espiritual Espiritual: .lancachastiefol
 */
module.exports = {
    name: "lancachastiefol",
    aliases: ["lancachastiefol-cmd","cmd-lancachastiefol"],
    category: "rpg",
    subcategory: "Lore",
    description: "História e materiais da Lança Espiritual Espiritual: .lancachastiefol",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🌿 *LANÇA ESPIRITUAL ESPIRITUAL*\n\n▫️ Forjada a partir do tronco da Árvore Sagrada no reino das fadas.\n▫️ Material mais resistente que qualquer aço terreno, com qualidades misteriosas de regeneração instantânea.`);
        }
};
