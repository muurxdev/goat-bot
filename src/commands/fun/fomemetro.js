/**
 * Comando .fomemetro — mede o nível de fome de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "fomemetro",
    aliases: ["fome","fominha"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de fome de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de fome", "@pessoa — mede o nível de fome de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "fomemetro",
            emoji: "🍔",
            oque: "fome",
            vereditos: ["Acabou de comer, nem pense em comida.","Um petisco cairia bem.","Já está de olho no cardápio da taverna.","Comeria a comida do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ sem reclamar.","Fome de Guerreira depois de uma batalha."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
