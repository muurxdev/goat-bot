/**
 * Comando .nomehacker — Codinome hacker
 *
 * Os arrays estavam TROCADOS: a lista de aliases ("hackername", "nickhacker")
 * tinha ido parar no prefixo do nome, e a lista de sufixos ("Wolf", "Byte", "X"…)
 * tinha ido para o campo `aliases`. O efeito era duplo:
 *   - o comando gerava lixo: "nickhackerZero", "hackernameDark";
 *   - `.x`, `.net`, `.core`, `.void`, `.byte`… viraram atalhos deste comando,
 *     roubando o `.x` do Twitter/X.
 */
const F = require("../../utils/formato");
module.exports = {
    name: "nomehacker",
    aliases: ["hackername", "nickhacker", "codinome"],
    category: "fun",
    subcategory: "Diversão",
    description: "Gera um codinome hacker aleatório",
    examples: [" — sorteia um codinome hacker"],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = "." }) => {
        const PREFIXOS = ["Dark", "Cyber", "Null", "Ghost", "Neo", "Byte", "Root", "Zero", "Shadow", "Crypt"];
        const SUFIXOS = ["Wolf", "Byte", "X", "Storm", "Kernel", "Void", "Blade", "Net", "Core", "0x"];
        const nome = PREFIXOS[Math.floor(Math.random() * PREFIXOS.length)] +
                     SUFIXOS[Math.floor(Math.random() * SUFIXOS.length)];
        return reply(F.tela({
            emoji: "💻",
            titulo: "Codinome hacker",
            intro: "Seu codinome é *" + nome + "*.",
            dica: "Use no apelido do grupo e ninguém vai saber quem é você.",
            proximos: [
                { nome: "nomehacker", oque: "gerar outro codinome" },
                { nome: "nomerpg", oque: "um nome de RPG" }
            ],
            prefix
        }));
    }
};
