/**
 * Comando .duelofisico — Simula queda de braço épica como ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ vs Ban: .duelofisico
 */
module.exports = {
    name: "duelofisico",
    aliases: ["duelofisico-cmd","cmd-duelofisico"],
    category: "fun",
    subcategory: "Jogos",
    description: "Simula queda de braço épica como ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ vs Ban: .duelofisico",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const placar = Math.floor(Math.random() * 500) + 200;
            return reply(`💪💥 *QUEDA DE BRAÇO DE REINO*\n\nO chão tremeu, as vigas do teto estalaram!\nPlacar de vitórias acumuladas: *${placar} a ${placar - 1}*!\nO combate terminou em um choque sísmico que derrubou a parede!`);
        }
};
