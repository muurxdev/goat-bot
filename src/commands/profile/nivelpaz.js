/**
 * Comando .nivelpaz — Mede o nível de serenidade mental do herói.
 */
const F = require("../../utils/formato");
const { marcar } = require("../../utils/textoRpg");

module.exports = {
    name: "nivelpaz",
    aliases: ["nivelpaz-cmd", "cmd-nivelpaz"],
    category: "profile",
    subcategory: "Status",
    description: "Mede o nível de serenidade mental do herói",
    examples: [" — mede sua paz espiritual de hoje, de 50% a 99%"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = "." }) => {
        const p = Math.floor(Math.random() * 50) + 50;
        const estado = p >= 90 ? "Iluminado" : p >= 70 ? "Sereno" : "Em busca do equilíbrio";
        return reply(F.tela({
            emoji: "🕊️",
            titulo: "Equilíbrio interior",
            intro: `${marcar(sender)}, sua paz espiritual está em *${p}%*. A mente está calma como a água da nascente druídica.`,
            secoes: [{ emoji: "🌊", titulo: "Leitura", linhas: [
                F.campo("Paz", F.barra(p / 100)),
                F.campo("Estado", estado)
            ] }],
            dica: "Os druidas dizem que ninguém fica abaixo de 50%. É só por diversão: a leitura muda a cada consulta.",
            proximos: [
                { nome: "nivelira", oque: "medir a fúria do dragão" },
                { nome: "afinidadedom", oque: "descobrir o elemento da sua alma" }
            ],
            prefix
        }), [sender]);
    }
};
