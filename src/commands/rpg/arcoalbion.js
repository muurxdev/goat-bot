/**
 * Comando .arcoalbion — Registros sobre o Monstro Golem Albion: .arcoalbion
 */
module.exports = {
    name: "arcoalbion",
    aliases: ["arcoalbion-cmd","cmd-arcoalbion"],
    category: "rpg",
    subcategory: "Inimigos",
    description: "Registros sobre o Monstro Golem Albion: .arcoalbion",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`👹 *GOLEM ANCESTRAL: ALBION*\n\n▫️ Criaturas bélicas colossais criadas pelo Clã dos Demônios na Guerra Antiga.\n▫️ Altura de centenas de metros e capacidade de cuspir fogo concentrado capaz de aniquilar cidades inteiras.`);
        }
};
