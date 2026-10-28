/**
 * Comando .belezometro — mede o nível de beleza de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "belezometro",
    aliases: ["beleza","belezura"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de beleza de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de beleza", "@pessoa — mede o nível de beleza de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "belezometro",
            emoji: "😎",
            oque: "beleza",
            vereditos: ["Hoje o espelho pediu folga.","Beleza discreta, do tipo que cresce com a convivência.","Charme na medida certa.","Está chamando atenção na taverna.","Nem a Deusa Princesa ficaria indiferente."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
