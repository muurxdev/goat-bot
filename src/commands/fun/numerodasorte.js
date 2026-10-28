/**
 * Comando .numerodasorte — Gera seus 6 números da sorte para apostas e jogos: .numerodasorte
 */
const F = require("../../utils/formato");
module.exports = {
    name: "numerodasorte",
    aliases: ["numerodasorte-cmd","cmd-numerodasorte"],
    category: "fun",
    subcategory: "Sorte",
    description: "Gera 6 números da sorte (de 1 a 60) para apostas e jogos",
    examples: [" — sorteia 6 números de 1 a 60"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const nums = [];
            while (nums.length < 6) {
                const n = Math.floor(Math.random() * 60) + 1;
                if (!nums.includes(n)) nums.push(n);
            }
            nums.sort((a, b) => a - b);
            return reply(F.tela({
                emoji: "🍀",
                titulo: "Números da sorte",
                intro: `*${nums.join(" · ")}*`,
                secoes: [{ emoji: "🎟️", titulo: "Sobre o sorteio", linhas: [
                    F.campo("Quantidade", "6 números, sem repetir"),
                    F.campo("Faixa", "de 1 a 60")
                ] }],
                dica: "Que a graça das deusas ilumine o seu bilhete! Mas sorte não se garante.",
                proximos: [
                    { nome: "numerodasorte", oque: "sortear outros números" },
                    { nome: "sortometro", oque: "medir sua sorte de hoje" }
                ],
                prefix
            }));
        }
};
