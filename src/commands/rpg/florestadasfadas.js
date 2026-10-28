/**
 * Comando .florestadasfadas — Viaja até a Floresta do Rei das Fadas: .florestadasfadas
 */
module.exports = {
    name: "florestadasfadas",
    aliases: ["florestadasfadas-cmd","cmd-florestadasfadas"],
    category: "rpg",
    subcategory: "Local",
    description: "Viaja até a Floresta do Rei das Fadas: .florestadasfadas",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🌳 *FLORESTA DO REI DAS FADAS*\n\n▫️ Uma floresta sagrada isolada do mundo mortal.\n▫️ O ar cheira a néctar e pólen místico.\n▫️ Não existem doenças nem decadência aqui, sustentada pela Árvore Sagrada.`);
        }
};
