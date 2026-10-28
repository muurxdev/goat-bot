/**
 * Comando .burrometro — mede o nível de burrice de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "burrometro",
    aliases: ["burrice","medidorburro"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de burrice de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de burrice", "@pessoa — mede o nível de burrice de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "burrometro",
            emoji: "🤪",
            oque: "burrice",
            vereditos: ["Mente afiada como a de Mago.","Só uns tropeços leves hoje.","Metade gênio, metade Guardião.","Cuidado para não assinar nada hoje.","Nível Guardião: pensa mais em comida do que em contas."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
