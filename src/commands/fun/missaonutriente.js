/**
 * Comando .missaonutriente — Cardápio do dia sugerido pelo Guardião: .missaonutriente
 */
module.exports = {
    name: "missaonutriente",
    aliases: ["missaonutriente-cmd","cmd-missaonutriente"],
    category: "fun",
    subcategory: "Humor",
    description: "Cardápio do dia sugerido pelo Guardião: .missaonutriente",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🐷🍲 *MENU DO MESTRE GUARDIÃO*\n\n\"Oink! O cardápio especial de hoje é:\n▫️ Restos de torta de carne de Vilarejo\n▫️ Batatas assadas levemente queimadas pelo GOAT\n▫️ Caneca de suco de maçã da floresta\nComa tudo pra ficar forte como o Capitão das Sobras!\"");
        }
};
