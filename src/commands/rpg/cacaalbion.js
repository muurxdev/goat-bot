/**
 * Comando .cacaalbion — Participa da caçada ao monstro Albion: .cacaalbion
 */
module.exports = {
    name: "cacaalbion",
    aliases: ["cacaalbion-cmd","cmd-cacaalbion"],
    category: "rpg",
    subcategory: "Batalha",
    description: "Participa da caçada ao monstro Albion: .cacaalbion",
    cooldownMs: 3500,
    execute: async ({ reply }) => {
            const danoCausado = Math.floor(Math.random() * 2500) + 1200;
            return reply(`⚔️ *BATALHA CONTRA O ALBION*\n\nVocê salta em direção ao núcleo do colosso de pedra!\n💥 Golpe devastador desferido: *${danoCausado} de Dano!*\nO Albion solta um bramido sísmico e seu núcleo começa a trincar!`);
        }
};
