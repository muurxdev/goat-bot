/**
 * Comando .coragemetro — mede o nível de coragem de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "coragemetro",
    aliases: ["coragem","bravura"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de coragem de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de coragem", "@pessoa — mede o nível de coragem de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "coragemetro",
            emoji: "🦁",
            oque: "coragem",
            vereditos: ["Fugiria até de uma galinha.","Coragem tímida, mas existe.","Encara o perigo se tiver companhia.","Entraria numa dungeon sem pensar duas vezes.","Coragem de Herói ao meio-dia."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
