/**
 * Comando .piadaseca — Conta uma piada seca ou trocadilho rápido: .piadaseca
 */
const F = require("../../utils/formato");
module.exports = {
    name: "piadaseca",
    aliases: ["piadaseca-cmd","cmd-piadaseca"],
    category: "fun",
    subcategory: "Humor",
    description: "Conta uma piada seca ou trocadilho rápido",
    examples: [" — conta uma piada seca"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const piadas = [
                "Por que o livro de matemática se suicidou? Porque tinha muitos problemas!",
                "Qual é o peixe que caiu do 10º andar? Aaaaah-tum!",
                "O que o pato falou para a pata? Vem Quá!",
                "Por que os químicos são ótimos em resolver problemas? Porque eles têm todas as soluções!"
            ];
            const [pergunta, ...resto] = piadas[Math.floor(Math.random() * piadas.length)].split("? ");
            const resposta = resto.join("? ");
            return reply(F.tela({
                emoji: "😂",
                titulo: "Piada seca",
                intro: resposta ? `*${pergunta}?*\n\n_${resposta}_` : pergunta,
                dica: "Piada seca boa é a que faz o grupo suspirar em vez de rir.",
                proximos: [
                    { nome: "piadaseca", oque: "outra piada seca" },
                    { nome: "piada", oque: "piada de pergunta e resposta" }
                ],
                prefix
            }));
        }
};
