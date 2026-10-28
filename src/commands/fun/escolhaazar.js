/**
 * Comando .escolhaazar — Sorteia quem paga a conta ou cumpre a prenda no grupo: .escolhaazar
 */
module.exports = {
    name: "escolhaazar",
    aliases: ["escolhaazar-cmd","cmd-escolhaazar"],
    category: "fun",
    subcategory: "Jogos",
    description: "Sorteia quem paga a conta ou cumpre a prenda no grupo: .escolhaazar",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🎯 *ROLETA DA PRENDA*\n\nA garrafa girou no centro da mesa do Javali...\nE parou apontando exatamente para... *A PESSOA QUE MANDAR A PRÓXIMA MENSAGEM!* 😂🍺");
        }
};
