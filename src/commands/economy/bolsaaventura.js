/**
 * Comando .bolsaaventura — Verifica os itens de valor guardados na sua bolsa de aventureiro: .bolsaaventura
 */
module.exports = {
    name: "bolsaaventura",
    aliases: ["bolsaaventura-cmd","cmd-bolsaaventura","cmd_bolsaaventura","alt_bolsaaventura","atalho_bolsaaventura","abrev_bolsaaventura","call_bolsaaventura","func_bolsaaventura"],
    category: "economy",
    subcategory: "Item",
    description: "Verifica os itens de valor guardados na sua bolsa de aventureiro: .bolsaaventura",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🎒 *BOLSA DE AVENTUREIRO*\n\n▫️ 3x Poções de Cura\n▫️ 1x Pedra de Fogo\n▫️ 2x Cordas Élficas\n▫️ 1x Cantil com Cerveja de Bernia\n▫️ Espaço restante: 8 slots`);
        }
};
