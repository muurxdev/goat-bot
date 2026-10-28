/**
 * Comando .duelopalavras — Duelo de rimas e palavras rápidas: .duelopalavras
 */
const F = require("../../utils/formato");
module.exports = {
    name: "duelopalavras",
    aliases: ["duelopalavras-cmd","cmd-duelopalavras"],
    category: "fun",
    subcategory: "Jogos",
    description: "Duelo de rimas: sorteia um tema e vence quem rimar primeiro",
    examples: [" — sorteia um tema para o duelo de rimas"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const temas = ["Dragão", "Castelo", "Guerreiro", "Tempestade", "Purgatório"];
            const t = temas[Math.floor(Math.random() * temas.length)];
            return reply(F.tela({
                emoji: "🎤",
                titulo: "Duelo de palavras",
                intro: `Tema sorteado: *${t}*`,
                secoes: [{ emoji: "📜", titulo: "Como vencer", linhas: [
                    "• Mande *3 palavras* que rimem com o tema.",
                    "• Quem mandar primeiro no chat vence.",
                    "• O grupo confere se as rimas valem."
                ] }],
                dica: "Rima boa termina com o mesmo som: castelo, martelo, amarelo.",
                proximos: [
                    { nome: "duelopalavras", oque: "sortear outro tema" },
                    { nome: "stopletra", oque: "rodada de stop" }
                ],
                prefix
            }));
        }
};
