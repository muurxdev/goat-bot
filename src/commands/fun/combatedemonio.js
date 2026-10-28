/**
 * Comando .combatedemonio — Batalha rápida contra um Demônio Vermelho com cálculo de dano
 */
module.exports = {
    name: "combatedemonio",
    aliases: ["lutarvermelho"],
    category: "fun",
    subcategory: "Jogos",
    description: "Batalha rápida contra um Demônio Vermelho com cálculo de dano",
    cooldownMs: 2500,
    execute: async ({ sender, reply }) => {
            const playerDmg = Math.floor(Math.random() * 800) + 200;
            const demonHp = 750;
            if (playerDmg >= demonHp) {
                return reply(`⚔️ *BATALHA CONTRA DEMÔNIO VERMELHO*\n\n🔥 Você desferiu um golpe de *${playerDmg} de dano*!\n💥 *O Demônio foi pulverizado com sucesso!*\n\n🏆 Recompensa: Honra de Cavaleiro Sagrado.`);
            }
            return reply(`⚔️ *BATALHA CONTRA DEMÔNIO VERMELHO*\n\nVocê causou *${playerDmg} de dano*, mas o demônio tinha *${demonHp} HP*!\n⚠️ O demônio contra-atacou com Chamas do Purgatório e você precisou recuar!`);
        }
};
