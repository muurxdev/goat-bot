/**
 * Comando .quizcultura / .perguntaquiz / .desafioquiz
 * Quiz de conhecimentos gerais (geografia, ciência, história, língua e esportes).
 * Renomeado de .quizanime: o nome `quiz` já pertence a fun/quiz.js.
 */

const { renderCard } = require("../../utils/uiEngine");

const QUIZ_LIST = [
    {
        p: "Qual é a capital da Austrália?",
        op: ["A) Sydney", "B) Melbourne", "C) Canberra", "D) Perth"],
        r: "C",
        ex: "Canberra foi escolhida como capital federal em 1908, como meio-termo entre Sydney e Melbourne."
    },
    {
        p: "Qual é o maior planeta do Sistema Solar?",
        op: ["A) Saturno", "B) Júpiter", "C) Netuno", "D) Urano"],
        r: "B",
        ex: "Júpiter tem massa maior que a soma de todos os outros planetas do Sistema Solar."
    },
    {
        p: "Qual é o símbolo químico do ouro?",
        op: ["A) Ag", "B) Go", "C) Au", "D) Or"],
        r: "C",
        ex: "O símbolo Au vem do latim 'aurum', que significa ouro."
    },
    {
        p: "Quem pintou a Mona Lisa?",
        op: ["A) Michelangelo", "B) Rafael", "C) Leonardo da Vinci", "D) Botticelli"],
        r: "C",
        ex: "Leonardo da Vinci pintou a Mona Lisa no início do século XVI, em Florença."
    },
    {
        p: "Quantos jogadores de cada time estão em campo numa partida de futebol, incluindo o goleiro?",
        op: ["A) 9", "B) 10", "C) 11", "D) 12"],
        r: "C",
        ex: "Cada equipe tem 11 jogadores em campo, incluindo o goleiro."
    },
    {
        p: "Qual é o maior oceano do mundo?",
        op: ["A) Atlântico", "B) Índico", "C) Ártico", "D) Pacífico"],
        r: "D",
        ex: "O Oceano Pacífico cobre cerca de um terço da superfície da Terra."
    },
    {
        p: "Quem escreveu o romance 'Dom Casmurro'?",
        op: ["A) José de Alencar", "B) Machado de Assis", "C) Graciliano Ramos", "D) Euclides da Cunha"],
        r: "B",
        ex: "Dom Casmurro foi publicado por Machado de Assis em 1899."
    },
    {
        p: "Em que ano o Brasil proclamou a independência?",
        op: ["A) 1500", "B) 1789", "C) 1822", "D) 1889"],
        r: "C",
        ex: "A independência foi proclamada por Dom Pedro I em 7 de setembro de 1822."
    },
    {
        p: "Qual é a fórmula química da água?",
        op: ["A) CO2", "B) H2O", "C) NaCl", "D) O3"],
        r: "B",
        ex: "A molécula da água tem dois átomos de hidrogênio e um de oxigênio."
    },
    {
        p: "Qual é o maior deserto quente do mundo?",
        op: ["A) Gobi", "B) Kalahari", "C) Saara", "D) Atacama"],
        r: "C",
        ex: "O Saara fica no norte da África e é o maior deserto quente do planeta."
    },
    {
        p: "Qual país sediou a Copa do Mundo de Futebol de 2014?",
        op: ["A) África do Sul", "B) Rússia", "C) Alemanha", "D) Brasil"],
        r: "D",
        ex: "O Brasil sediou a Copa do Mundo masculina de 2014."
    }
];

module.exports = {
    name: "quizcultura",
    aliases: ["perguntaquiz", "desafioquiz"],
    category: "fun",
    description: "Desafie seus conhecimentos gerais com perguntas de múltipla escolha",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const item = QUIZ_LIST[Math.floor(Math.random() * QUIZ_LIST.length)];
        const respostaUser = (args[0] || "").toUpperCase().trim();

        if (!respostaUser) {
            const card = renderCard({
                title: "QUIZ DE CONHECIMENTOS GERAIS",
                icon: "🧠",
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
                tip: "Responda enviando .quizcultura <A, B, C ou D>!",
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
