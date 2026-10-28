/**
 * Comando .nivelego — Mede o tamanho do seu orgulho leonino: .nivelego
 */
module.exports = {
    name: "nivelego",
    aliases: ["nivelego-cmd","cmd-nivelego"],
    category: "profile",
    subcategory: "Status",
    description: "Mede o tamanho do seu orgulho leonino: .nivelego",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("☀️🦁 *TERMÔMETRO DO ORGULHO (HERÓI)*\n\nNível de Orgulho: *999.999%*\n\"E por que eu sentiria ódio de alguém mais fraco do que eu? Apenas sinto pena.\"");
        }
};
