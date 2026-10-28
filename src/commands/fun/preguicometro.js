/**
 * Comando .preguicometro — mede o nível de preguiça de alguém (brincadeira).
 * A tela e a conta ficam no medidorService, iguais para todos os medidores.
 */
const { medir } = require("../../services/medidorService");

module.exports = {
    name: "preguicometro",
    aliases: ["preguica","lazy"],
    category: "fun",
    subcategory: "Diversão",
    description: "Mede, de brincadeira, o nível de preguiça de alguém hoje",
    usage: "[@pessoa]",
    examples: [" — mede o seu nível de preguiça", "@pessoa — mede o nível de preguiça de alguém"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, mentionedJid, prefix = "." }) => {
        const { texto, mencoes } = medir({
            chave: "preguicometro",
            emoji: "😴",
            oque: "preguiça",
            vereditos: ["Disposição de guerreiro em treino.","Uma soneca não faria mal.","Só levanta se tiver comida.","Preguiça de King flutuando no travesseiro.","Nem o fim do mundo tira da cama."],
            sender, mentionedJid, prefix
        });
        return reply(texto, mencoes);
    }
};
