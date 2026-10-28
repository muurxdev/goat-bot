/**
 * Comando .sortometro — mede o nível de sorte de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "sortometro",
    aliases: ["sortemetro","medidorsorte"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de sorte de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de sorte", "@pessoa — mede o nível de sorte de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "sortometro",
            emoji: "🍀",
            oque: "sorte",
            vereditos: ["Melhor não apostar nada hoje.","Sorte tímida, jogue com cuidado.","Dia normal: nem azar, nem sorte.","As deusas estão sorrindo para você.","Sorte lendária: tente a roleta hoje."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
