/**
 * Comando .reidocaos — Desperta a profecia do Rei do Caos e o poder de Arthur Pendragon: .reidocaos
 */
module.exports = {
    name: "reidocaos",
    aliases: ["reidocaos-cmd","cmd-reidocaos"],
    category: "rpg",
    subcategory: "Caos",
    description: "Desperta a profecia do Rei do Caos e o poder de Arthur Pendragon: .reidocaos",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply(`👑🌌 *O DESPERTAR DO CAOS PRIMORDIAL*\n\n"Antes da luz e das trevas existirem, apenas o Caos reinava no vazio infinito.\nEle gerou a Suprema Divindade, o Rei Demônio e a Árvore Sagrada.\nAgora, o poder primordial do Caos reside em Arthur Pendragon, o verdadeiro Rei de Cidade Dourada!"\n✨ Uma onda de energia cósmica envolve a lâmina sagrada Excalibur!`);
        }
};
