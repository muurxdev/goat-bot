/**
 * Comando .nerdometro — mede o nível de nerd de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "nerdometro",
    aliases: ["nerd","nerdice"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de nerd de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de nerd", "@pessoa — mede o nível de nerd de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "nerdometro",
            emoji: "🤓",
            oque: "nerd",
            vereditos: ["Nunca abriu um livro por vontade própria.","Nerd de fim de semana.","Sabe umas curiosidades de cabeça.","Tem opinião forte sobre versões de jogo.","Nerd lendário: decorou a biblioteca de Mago."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
