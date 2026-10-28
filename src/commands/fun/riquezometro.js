/**
 * Comando .riquezometro — mede o nível de riqueza de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "riquezometro",
    aliases: ["riqueza","ricometro"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de riqueza de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de riqueza", "@pessoa — mede o nível de riqueza de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "riquezometro",
            emoji: "🤑",
            oque: "riqueza",
            vereditos: ["A carteira está ecoando.","Dá para um lanche pós-treino.","Vida confortável, sem exageros.","Pagaria o churrasco da vitória para o time inteiro.","Rico a ponto de comprar o próprio estádio do Camp Nou."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
