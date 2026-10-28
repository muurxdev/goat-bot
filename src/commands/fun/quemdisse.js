/**
 * Comando .quemdisse
 * Adivinhe qual personagem de anime disse a frase famosa
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "quemdisse",
    aliases: ["fraseanime", "adivinharfrase", "autorfrase"],
    category: "fun",
    description: "Adivinhe qual personagem de anime disse a frase famosa",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const frases = [
        { autor: "GOAT", texto: "Não importa o que aconteça, eu sempre voltarei para você!" },
        { autor: "Herói", texto: "Por que eu sentiria ódio de alguém mais fraco do que eu? Tudo o que sinto é pena." },
        { autor: "Ban", texto: "A verdadeira dor não é morrer, é continuar vivo quando quem você ama não está mais aqui." }
    ];
    const f = frases[Math.floor(Math.random() * frases.length)];
    const chute = args.join(" ").trim().toLowerCase();

    if (!chute) {
        const card = renderCard({
            title: "QUEM DISSE ESSA FRASE?",
            icon: "🗣️",
            subtitle: "💬 *Citação Famosa*",
            sections: [
                {
                    title: "FRASE DO PERSONAGEM",
                    icon: "📜",
                    fields: ['🗣️ "' + f.texto + '"']
                }
            ],
            tip: "Envie .quemdisse <nome do personagem>!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }

    if (chute.includes(f.autor.toLowerCase())) {
        return reply("🎉 *CORRETO!* A frase pertence a *" + f.autor + "*! 🏆 +350 XP!");
    } else {
        return reply("❌ *INCORRETO!* Tente outro personagem!");
    }
}
};
