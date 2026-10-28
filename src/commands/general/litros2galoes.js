/**
 * Comando .litros2galoes — Converte Litros para Galões (EUA): .litros2galoes 10
 */
module.exports = {
    name: "litros2galoes",
    aliases: ["litros2galoes-cmd","cmd-litros2galoes"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Litros para Galões (EUA): .litros2galoes 10",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const l = parseFloat(args[0]);
            if (isNaN(l) || l < 0) return reply("❌ Digite o volume em litros.");
            const gal = l * 0.264172;
            return reply(`🛢️ *${l} L* = *${gal.toFixed(2)} gal (US)*`);
        }
};
