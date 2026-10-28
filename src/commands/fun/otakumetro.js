/**
 * Comando .otakumetro — mede o nível de otaku de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "otakumetro",
    aliases: ["otaku","weeb"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de otaku de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de otaku", "@pessoa — mede o nível de otaku de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "otakumetro",
            emoji: "🍥",
            oque: "otaku",
            vereditos: ["Acha que anime é desenho de criança.","Viu uns episódios por acaso.","Já tem um personagem favorito.","Maratona temporadas inteiras numa noite.","Otaku supremo: sabe o poder de cada Pecado."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
