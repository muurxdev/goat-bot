/**
 * Comando .soprovital — Canaliza o sopro de vida vegetal: .soprovital
 */
module.exports = {
    name: "soprovital",
    aliases: ["soprovital-cmd","cmd-soprovital"],
    category: "rpg",
    subcategory: "Magia",
    description: "Canaliza o sopro de vida vegetal: .soprovital",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🌱 *SOPRO VITAL DA FLORESTA*\n\n▫️ Folhas brilhantes caem suavemente sobre seus ombros.\n▫️ Toda a sua fadiga e pontos de mana (MP) foram completamente revigorados!`);
        }
};
