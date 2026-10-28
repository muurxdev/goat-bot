/**
 * Comando .qualanime
 * Adivinhe o anime pela sinopse descrita
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "qualanime",
    aliases: ["adivinhanime", "qual-o-anime", "quizsinopse"],
    category: "fun",
    description: "Adivinhe o anime pela sinopse descrita",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const sinopses = [
        { anime: "Saga Épica", dica: "Um grupo de cavaleiros sagrados renegados tenta salvar o Reino Central liderados por um guerreiro loiro imortal." },
        { anime: "Death Note", dica: "Um estudante do ensino médio encontra um caderno sobrenatural capaz de matar quem tiver o nome escrito nele." },
        { anime: "Attack on Titan", dica: "A humanidade vive cercada por três muralhas gigantes para se proteger de humanoides canibais titânicos." }
    ];
    const sorteado = sinopses[Math.floor(Math.random() * sinopses.length)];
    const chute = args.join(" ").trim().toLowerCase();

    if (!chute) {
        const card = renderCard({
            title: "QUAL É O ANIME?",
            icon: "⛩️",
            subtitle: "🎬 *Desafio de Conhecimento Otaku*",
            sections: [
                {
                    title: "SINOPSE DA HISTÓRIA",
                    icon: "📜",
                    fields: ['📖 "' + sorteado.dica + '"']
                }
            ],
            tip: "Envie .qualanime <nome do anime> para tentar adivinhar!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }

    if (chute.includes(sorteado.anime.toLowerCase())) {
        return reply("🎉 *ACERTOU EM CHEIO!* O anime era mesmo *" + sorteado.anime + "*! 🏆 +300 XP!");
    } else {
        return reply("❌ *ERROU!* Tente novamente com outra resposta!");
    }
}
};
