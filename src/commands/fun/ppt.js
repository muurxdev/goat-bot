/**
 * Comando .ppt
 * Pedra, Papel e Tesoura clássico contra o bot
 */
const F = require("../../utils/formato");

const CHOICES = ["pedra", "papel", "tesoura"];
const EMOJIS = { pedra: "🪨 Pedra", papel: "📄 Papel", tesoura: "✂️ Tesoura" };

module.exports = {
    name: "ppt",
    aliases: ["jokenpo", "pedrapapeltesoura"],
    category: "fun",
    description: "Jogue pedra, papel ou tesoura (jokenpô) contra mim",
    usage: "<pedra|papel|tesoura>",
    examples: ["pedra — joga pedra", "papel — joga papel", "tesoura — joga tesoura"],
    subcategory: "Jogos",
    execute: async ({ args, reply, prefix = "." }) => {
        const userChoice = (args && args[0]) ? args[0].toLowerCase().trim() : "";

        if (!CHOICES.includes(userChoice)) {
            return reply(F.tela({
                emoji: "✂️",
                titulo: "Pedra, papel ou tesoura",
                intro: userChoice ? `Não conheço a jogada *${userChoice}*. Escolha uma das três:` : "Escolha sua jogada e eu mostro a minha ao mesmo tempo.",
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    "• " + F.cmd(prefix, "ppt", "pedra") + " 🪨 — ganha da tesoura",
                    "• " + F.cmd(prefix, "ppt", "papel") + " 📄 — ganha da pedra",
                    "• " + F.cmd(prefix, "ppt", "tesoura") + " ✂️ — ganha do papel"
                ] }],
                dica: "Aqui é só diversão, sem aposta.",
                prefix
            }));
        }

        const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

        let result = "";
        if (userChoice === botChoice) {
            result = "🤝 *Empate!* Escolhemos a mesma coisa.";
        } else if (
            (userChoice === "pedra" && botChoice === "tesoura") ||
            (userChoice === "papel" && botChoice === "pedra") ||
            (userChoice === "tesoura" && botChoice === "papel")
        ) {
            result = "🎉 *Você venceu!* Golpe perfeito.";
        } else {
            result = "😈 *Eu venci!* Mais sorte na próxima rodada.";
        }

        return reply(F.tela({
            emoji: "🎮",
            titulo: "Pedra, papel ou tesoura",
            intro: result,
            secoes: [{ emoji: "✋", titulo: "Jogadas", linhas: [
                F.campo("Você", EMOJIS[userChoice]),
                F.campo("Eu", EMOJIS[botChoice])
            ] }],
            proximos: [
                { nome: "ppt", args: "pedra", oque: "jogar de novo" },
                { nome: "velha", args: "bot", oque: "jogo da velha contra mim" }
            ],
            prefix
        }));
    }
};

