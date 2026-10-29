/**
 * Comando .romanticometro — mede o nível de romantismo de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "romanticometro",
    aliases: ["romantico","romance"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de romantismo de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de romantismo", "@pessoa — mede o nível de romantismo de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "romanticometro",
            emoji: "💘",
            oque: "romantismo",
            vereditos: ["Romantismo de pedra.","Manda um coração de vez em quando.","Lembra das datas importantes.","Escreve cartas e declarações.","Romance digno de ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ e Princesa."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
