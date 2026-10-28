/**
 * Comando .cladasdeusas — História e poderes do Clã das Deusas: .cladasdeusas
 */
module.exports = {
    name: "cladasdeusas",
    aliases: ["cladasdeusas-cmd","cmd-cladasdeusas"],
    category: "rpg",
    subcategory: "Lore",
    description: "História e poderes do Clã das Deusas: .cladasdeusas",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🪽 *CLÃ DAS DEUSAS (Goddess Clan)*\n\n▫️ *Líder Divina:* A Suprema Divindade\n▫️ *Os Quatro Arcanjos:* Anjo, Ardente, Tarmiel, Sariel\n▫️ *Poder Mágico:* *Ark* (Partículas de luz que desintegram a escuridão)\n▫️ *Hierarquia:* Asas de luz purificadora, telepatia cósmica e possessão de receptáculos.`);
        }
};
