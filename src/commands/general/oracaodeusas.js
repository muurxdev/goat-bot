/**
 * Comando .oracaodeusas — Entoa uma prece por proteção celestial: .oracaodeusas
 */
module.exports = {
    name: "oracaodeusas",
    aliases: ["oracaodeusas-cmd","cmd-oracaodeusas"],
    category: "general",
    subcategory: "Roleplay",
    description: "Entoa uma prece por proteção celestial: .oracaodeusas",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🕊️✨ *ORAÇÃO ÀS DEUSAS*\n\n\"Que a luz do sol de Ardente e a corrente das águas de Tarmiel guiem nossos passos e purifiquem as sombras de nossa jornada.\"");
        }
};
