/**
 * Comando .mandamentopiedade — Testa o Mandamento da Piedade (Sombra): .mandamentopiedade
 */
module.exports = {
    name: "mandamentopiedade",
    aliases: ["mandamentopiedade-cmd","cmd-mandamentopiedade"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento da Piedade (Sombra): .mandamentopiedade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`👑 *MANDAMENTO DA PIEDADE (Sombra)*\n\n"Virar as costas para o representante do Rei Demônio é um ato de deslealdade absoluta!"\n⚠️ Qualquer um que fugir da batalha torna-se escravo sob submissão mental completa.`);
        }
};
