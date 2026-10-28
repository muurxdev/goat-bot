/**
 * Comando .frasealeatoria — Gera uma frase motivacional épica: .frasealeatoria
 */
const F = require("../../utils/formato");
module.exports = {
    name: "frasealeatoria",
    aliases: ["frasealeatoria-cmd","cmd-frasealeatoria"],
    category: "fun",
    subcategory: "Frases",
    description: "Gera uma frase motivacional épica",
    examples: [" — sorteia um pensamento épico"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
            const frases = [
                "Não importa o quão fundo você caia, a única direção restante é para cima!",
                "Até a escuridão mais densa é dissipada pela menor das fagulhas.",
                "Sua força não é medida pelo impacto do seu golpe, mas pela determinação em se levantar.",
                "Um verdadeiro guerreiro não luta porque odeia o que está na frente, mas porque ama o que está atrás."
            ];
            return reply(F.tela({
                emoji: "✨",
                titulo: "Pensamento do dia",
                intro: `_"${frases[Math.floor(Math.random() * frases.length)]}"_`,
                dica: "Guarde a que mais combinar com o seu dia.",
                proximos: [
                    { nome: "frasealeatoria", oque: "outro pensamento" },
                    { nome: "citacaosaga", oque: "citação dos Pecados Capitais" }
                ],
                prefix
            }));
        }
};
