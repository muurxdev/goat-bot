/**
 * Comando .orbecristal — Examina o Olho da Paz de Mago: .orbecristal
 */
module.exports = {
    name: "orbecristal",
    aliases: ["orbecristal-cmd","cmd-orbecristal"],
    category: "rpg",
    subcategory: "Item",
    description: "Examina o Olho da Paz de Mago: .orbecristal",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🔮 *ORBE DA MANIFESTAÇÃO (Aldan)*\n\n▫️ O orbe infinito que paira sobre a mão de Mago.\n▫️ Permite visão clarividente através de qualquer barreira e serve como receptáculo da alma.`);
        }
};
