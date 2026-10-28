/**
 * Comando .sonometro — mede o nível de sono de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "sonometro",
    aliases: ["sono","sonolencia"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de sono de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de sono", "@pessoa — mede o nível de sono de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "sonometro",
            emoji: "💤",
            oque: "sono",
            vereditos: ["Acordado e cheio de energia.","Um bocejo aqui, outro ali.","Os olhos já estão pesando.","Cochilaria em pé na fila.","Dorme até em pé no meio da batalha."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
