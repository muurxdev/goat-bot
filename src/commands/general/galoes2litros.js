/**
 * Comando .galoes2litros — Converte Galões (EUA) para Litros: .galoes2litros 5
 */
module.exports = {
    name: "galoes2litros",
    aliases: ["galoes2litros-cmd","cmd-galoes2litros"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Galões (EUA) para Litros: .galoes2litros 5",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const gal = parseFloat(args[0]);
            if (isNaN(gal) || gal < 0) return reply("❌ Digite o volume em galões.");
            const l = gal / 0.264172;
            return reply(`🛢️ *${gal} gal* = *${l.toFixed(2)} L*`);
        }
};
