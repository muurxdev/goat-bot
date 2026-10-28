/**
 * Comando .travafrases — Envia um trava-línguas clássico para testar a dicção: .travafrases
 */
const F = require("../../utils/formato");
module.exports = {
    name: "travafrases",
    aliases: ["travafrases-cmd","cmd-travafrases"],
    category: "fun",
    subcategory: "Desafios",
    description: "Envia um trava-línguas clássico para testar a dicção",
    examples: [" — sorteia um trava-línguas"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            const travas = [
                "O rato roeu a roupa do rei de Roma.",
                "Três pratos de trigo para três tigres tristes.",
                "Sabia que o sabiá sabia assobiar?",
                "O doce perguntou pro doce qual é o doce mais doce."
            ];
            return reply(F.tela({
                emoji: "👅",
                titulo: "Trava-línguas",
                intro: `*${travas[Math.floor(Math.random() * travas.length)]}*`,
                secoes: [{ emoji: "🎯", titulo: "Desafio", linhas: [
                    "Fale 3 vezes seguidas, rápido e sem gaguejar.",
                    "Para provar, mande em áudio no grupo."
                ] }],
                dica: "Comece devagar e vá acelerando a cada repetição.",
                proximos: [
                    { nome: "travafrases", oque: "outro trava-línguas" },
                    { nome: "desafioaleatorio", oque: "desafio relâmpago" }
                ],
                prefix
            }));
        }
};
