/**
 * Comando .espadaquebrada — Empunha o punho da Espada Quebrada do Dragão: .espadaquebrada
 */
module.exports = {
    name: "espadaquebrada",
    aliases: ["espadaquebrada-cmd","cmd-espadaquebrada"],
    category: "rpg",
    subcategory: "Equipamento",
    description: "Empunha o punho da Espada Quebrada do Dragão: .espadaquebrada",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🐉 *EMPUNHADURA DO DRAGÃO*\n\nVocê empunha a lâmina partida que sela o Caixão das Trevas Eternas!\n▫️ *Portador:* ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤\n▫️ *Efeito:* Intimidação draconiana! Monstros de nível baixo recuam em pavor.\n▫️ *Contra-ataque Total:* Pronto para refletir qualquer investida mágica direta!`);
        }
};
