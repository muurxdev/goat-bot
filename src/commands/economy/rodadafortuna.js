/**
 * Comando .rodadafortuna — gira a roda da fortuna e sorteia um multiplicador.
 * É só diversão: não aposta nem paga moedas.
 */

const F = require("../../utils/formato");

const MULTIS = ["1x", "1,5x", "2x", "3x", "0x", "5x", "10x"];

module.exports = {
    name: "rodadafortuna",
    aliases: ["rodadafortuna-cmd","cmd-rodadafortuna","cmd_rodadafortuna","alt_rodadafortuna","atalho_rodadafortuna","abrev_rodadafortuna","call_rodadafortuna","func_rodadafortuna"],
    category: "economy",
    subcategory: "Cassino",
    description: "Gira a roda da fortuna e sorteia um multiplicador, só por diversão",
    examples: [" — gira a roda e mostra o multiplicador sorteado"],
    cooldownMs: 3000,
    execute: async ({ reply, prefix = "." }) => {
        const m = MULTIS[Math.floor(Math.random() * MULTIS.length)];
        const reacao = m === "10x" ? "O prêmio máximo da roda!" : m === "0x" ? "Caiu no zero. Ainda bem que era só de brincadeira." : "A roda parou.";

        return reply(F.tela({
            emoji: "🎡",
            titulo: `Roda da fortuna: ${m}`,
            intro: `A grande roda dourada girou... e parou em *${m}*. ${reacao}`,
            secoes: [{ emoji: "📋", titulo: "A roda", linhas: [
                F.campo("Sorteado", m),
                F.campo("Casas da roda", MULTIS.join(" · ")),
                F.campo("Moedas", "nenhuma: esta roda é só diversão")
            ] }],
            dica: "Quer apostar de verdade? O caça-níqueis da taverna paga até 10x.",
            proximos: [
                { nome: "rodadafortuna", oque: "girar de novo" },
                { nome: "cassino", args: "100", oque: "apostar 100 moedas no caça-níqueis" }
            ],
            prefix
        }));
    }
};
