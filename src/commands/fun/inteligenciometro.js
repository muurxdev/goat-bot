/**
 * Comando .inteligenciometro — mede o nível de inteligência de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "inteligenciometro",
    aliases: ["inteligencia","qi"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de inteligência de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de inteligência", "@pessoa — mede o nível de inteligência de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "inteligenciometro",
            emoji: "🧠",
            oque: "inteligência",
            vereditos: ["Hoje o cérebro tirou o dia de descanso.","Pensa devagar, mas chega lá.","Raciocínio em dia.","Mente afiada, resolve enigmas de primeira.","Inteligência de Mago: assustadora."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
