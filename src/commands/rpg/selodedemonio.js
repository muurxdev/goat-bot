/**
 * Comando .selodedemonio — História do Caixão das Trevas Eternas: .selodedemonio
 */
module.exports = {
    name: "selodedemonio",
    aliases: ["selodedemonio-cmd","cmd-selodedemonio"],
    category: "rpg",
    subcategory: "Lore",
    description: "História do Caixão das Trevas Eternas: .selodedemonio",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🔒 *CAIXÃO DAS TREVAS ETERNAS*\n\n▫️ O lendário artefato que selou todo o Clã dos Demônios por mais de 3.000 anos.\n▫️ Requer os quatro fragmentos elementares e sangue de uma apóstola das deusas para ser quebrado.`);
        }
};
