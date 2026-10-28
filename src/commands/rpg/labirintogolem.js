/**
 * Comando .labirintogolem — Enfrenta os Golems do Labirinto de Torre: .labirintogolem
 */
module.exports = {
    name: "labirintogolem",
    aliases: ["labirintogolem-cmd","cmd-labirintogolem"],
    category: "rpg",
    subcategory: "Desafio",
    description: "Enfrenta os Golems do Labirinto de Torre: .labirintogolem",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const vitoria = Math.random() > 0.3;
            if (vitoria) {
                return reply(`🗿 *LABIRINTO DE ROCHA DE DROLE*\n\nVocê desferiu um golpe certeiro no núcleo de terra do Golem!\n🎉 *Vitória!* O Golem se desfez em cascalho e você encontrou uma Gema de Âmbar (+300 EXP)!`);
            } else {
                return reply(`🗿 *LABIRINTO DE ROCHA DE DROLE*\n\nO braço maciço do Golem te arremessou contra o paredão rochoso!\n⚠️ Você escapou por pouco antes do labirinto se fechar.`);
            }
        }
};
