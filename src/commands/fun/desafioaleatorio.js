/**
 * Comando .desafioaleatorio — Lança um desafio relâmpago para agitar o chat: .desafioaleatorio
 */
const F = require("../../utils/formato");
module.exports = {
    name: "desafioaleatorio",
    aliases: ["desafioaleatorio-cmd","cmd-desafioaleatorio"],
    category: "fun",
    subcategory: "Social",
    description: "Lança um desafio relâmpago para agitar o chat",
    examples: [" — sorteia um desafio rápido para o grupo"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const d = [
                "Digite o alfabeto inteiro de trás pra frente sem errar!",
                "Envie o emoji mais bizarro do seu teclado agora!",
                "Fale uma frase sem usar a letra 'A'!",
                "Mande um trava-línguas em áudio de 5 segundos!"
            ];
            return reply(F.tela({
                emoji: "⚡",
                titulo: "Desafio relâmpago",
                intro: `*${d[Math.floor(Math.random() * d.length)]}*`,
                secoes: [{ emoji: "📜", titulo: "Regras do time", linhas: [
                    "Quem cumprir primeiro ganha o respeito do Vestiário dos Campeões.",
                    "O grupo decide se valeu."
                ] }],
                dica: "Sem coragem para este? Peça outro, mas o grupo vai lembrar.",
                proximos: [
                    { nome: "desafioaleatorio", oque: "outro desafio" },
                    { nome: "verdadeoudesafio", oque: "verdade ou desafio" }
                ],
                prefix
            }));
        }
};
