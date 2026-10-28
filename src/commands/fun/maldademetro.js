/**
 * Comando .maldademetro — mede o nível de maldade de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "maldademetro",
    aliases: ["maldade","vilao"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de maldade de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de maldade", "@pessoa — mede o nível de maldade de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "maldademetro",
            emoji: "😈",
            oque: "maldade",
            vereditos: ["Coração puro como o de Princesa.","Só umas travessuras leves.","Anjo de dia, diabinho à noite.","Melhor não emprestar dinheiro.","Os Dez Preceitos pediriam conselhos."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
