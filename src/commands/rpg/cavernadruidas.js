/**
 * Comando .cavernadruidas — Inicia provação na Caverna de Treinamento de Istar: .cavernadruidas
 */
module.exports = {
    name: "cavernadruidas",
    aliases: ["cavernadruidas-cmd","cmd-cavernadruidas"],
    category: "rpg",
    subcategory: "Treino",
    description: "Inicia provação na Caverna de Treinamento de Istar: .cavernadruidas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const exp = Math.floor(Math.random() * 800) + 400;
            return reply(`🧘 *TERRA SAGRADA DE ISTAR — CAVERNA DE TREINAMENTO*\n\nAs apóstolas Jenna e Zaneri liberam o selo âmbar!\nVocê enfrenta cópias sombrias dos seus maiores medos.\n✨ *Resultado:* Você superou o desafio e ganhou *+${exp} EXP* de combate!`);
        }
};
