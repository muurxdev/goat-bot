/**
 * Comando .fofurometro — mede o nível de fofura de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "fofurometro",
    aliases: ["fofura","fofo"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de fofura de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de fofura", "@pessoa — mede o nível de fofura de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "fofurometro",
            emoji: "🥰",
            oque: "fofura",
            vereditos: ["Hoje está mais para porco-espinho.","Fofura escondida, mas dá para achar.","Fofo o bastante para ganhar um cafuné.","Difícil resistir a apertar as bochechas.","Fofura nível Guardião comendo sobras."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
