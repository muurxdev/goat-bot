/**
 * Comando .dado20 — Rola um dado de 20 faces (D20 clássico de RPG)
 */
const F = require("../../utils/formato");
module.exports = {
    name: "dado20",
    aliases: ["rolardado"],
    category: "fun",
    subcategory: "Jogos",
    description: "Rola um dado de 20 faces (D20 clássico de RPG)",
    examples: [" — rola um D20 de RPG"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = "." }) => {
            const roll = Math.floor(Math.random() * 20) + 1;
            let comment = '';
            if (roll === 20) comment = '🔥 *SUCESSO DECISIVO / CRÍTICO!*';
            else if (roll === 1) comment = '💀 *FALHA CRÍTICA!* O destino zombou de você.';
            else if (roll >= 15) comment = '✨ *Ótimo resultado!*';
            else if (roll >= 10) comment = '👍 *Resultado moderado.*';
            else comment = '⚠️ *Resultado fraco.*';
            return reply(F.tela({
                emoji: "🎲",
                titulo: `D20: ${roll}`,
                intro: comment,
                secoes: [{ emoji: "🎯", titulo: "Resultado", linhas: [
                    F.campo("Número", `${roll} de 20`),
                    F.campo("Chance de tirar isso ou mais", `${Math.round((21 - roll) / 20 * 100)}%`)
                ] }],
                dica: "20 é sucesso crítico, 1 é falha crítica. De 15 para cima já é um ótimo resultado.",
                proximos: [
                    { nome: "dado20", oque: "rolar de novo" },
                    { nome: "dado100", oque: "rolar um D100" }
                ],
                prefix
            }));
        }
};
