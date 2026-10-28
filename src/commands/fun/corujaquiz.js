/**
 * Comando .corujaquiz — Pergunta rápida da Coruja Sábia: .corujaquiz
 */
const F = require("../../utils/formato");
module.exports = {
    name: "corujaquiz",
    aliases: ["corujaquiz-cmd","cmd-corujaquiz"],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta rápida da Coruja Sábia, com a resposta escondida",
    examples: [" — mostra um enigma da coruja com a resposta escondida"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            return reply(F.tela({
                emoji: "🦉",
                titulo: "Desafio da coruja sábia",
                intro: "O que é, o que é?\n*Quanto mais se tira, maior ele fica?*",
                secoes: [{ emoji: "🔒", titulo: "Resposta", linhas: ["Pense antes de olhar: ||Um buraco!||"] }],
                dica: "Quer valer XP e moedas? A charada pede a resposta no chat.",
                proximos: [
                    { nome: "charada", oque: "charada que vale prêmio" },
                    { nome: "quizcapitais", oque: "pergunta de capitais" }
                ],
                prefix
            }));
        }
};
