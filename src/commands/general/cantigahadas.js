/**
 * Comando .cantigahadas — Canta a suave melodia que ecoa na Floresta do Rei das Fadas: .cantigahadas
 */
module.exports = {
    name: "cantigahadas",
    aliases: ["cantigahadas-cmd","cmd-cantigahadas"],
    category: "general",
    subcategory: "Roleplay",
    description: "Canta a suave melodia que ecoa na Floresta do Rei das Fadas: .cantigahadas",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🎶🍃 *CANTIGA DA FLORESTA DAS FADAS*\n\nUm sussurro doce entre as copas centenárias, trazendo paz e sono tranquilo a todos os corações aflitos.");
        }
};
