/**
 * Comando .quizanime / .perguntaanime / .otakuquiz
 * Quiz temático exclusivo sobre animes com ranking e pontuação
 */

const { renderCard } = require("../../utils/uiEngine");

const QUIZ_LIST = [    {
        p: "Qual é o nome do criador original de Dragon Ball?",
        op: ["A) Akira Toriyama", "B) Eiichiro Oda", "C) Masashi Kishimoto", "D) Nakaba Suzuki"],
        r: "A",
        ex: "Akira Toriyama é o lendário mangaká criador da franquia Dragon Ball."
    }
];

module.exports = {
    name: "quizanime",
    aliases: ["perguntaanime", "otakuquiz", "desafioanime"],
    category: "fun",
    description: "Desafie seu conhecimento sobre Saga Épica e cultura anime",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const item = QUIZ_LIST[Math.floor(Math.random() * QUIZ_LIST.length)];
        const respostaUser = (args[0] || "").toUpperCase().trim();

        if (!respostaUser) {
            const card = renderCard({
                title: "QUIZ OFICIAL DOS SETE TRAÇOS",
                icon: "⛩️",
                subtitle: `🎯 *Desafiante:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "PERGUNTA DO DESAFIO",
                        icon: "❓",
                        fields: [
                            `📜 *${item.p}*`,
                            ...item.op
                        ]
                    }
                ],
                tip: "Responda enviando .quizanime <A, B, C ou D>!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (respostaUser === item.r) {
            return reply(`🎉 *RESPOSTA CORRETA!*\n\n✨ *Letra ${item.r}*\n💡 *Explicação:* ${item.ex}\n🏆 *Premiação:* +400 XP & +600 Coins!`);
        } else {
            return reply(`❌ *RESPOSTA INCORRETA!*\n\n📖 *A resposta certa era:* Letra *${item.r}*\n💡 *Explicação:* ${item.ex}`);
        }
    }
};

