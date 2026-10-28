/**
 * Comando .dado100 — Rola um dado percentual de 100 faces (D100)
 */
const F = require("../../utils/formato");
module.exports = {
    name: "dado100",
    aliases: ["d100","rolard100"],
    category: "fun",
    subcategory: "Jogos",
    description: "Rola um dado percentual de 100 faces (D100)",
    examples: [" — rola um dado de 100 faces"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
            const roll = Math.floor(Math.random() * 100) + 1;
            return reply(F.tela({
                emoji: "🎲",
                titulo: `D100: ${roll}`,
                intro: `Rolei o dado de 100 faces e caiu *${roll}*.`,
                secoes: [{ emoji: "🎯", titulo: "Resultado", linhas: [
                    F.campo("Número", `${roll} de 100`),
                    F.barra(roll / 100)
                ] }],
                dica: "No RPG, o D100 serve para testes de porcentagem: tirou menos que a chance, passou.",
                proximos: [
                    { nome: "dado100", oque: "rolar de novo" },
                    { nome: "dado20", oque: "rolar um D20" },
                    { nome: "dado", args: "2d6", oque: "escolher quantidade e faces" }
                ],
                prefix
            }));
        }
};
