/**
 * Comando .metros2pes — Converte Metros para Pés: .metros2pes 1.80
 */
module.exports = {
    name: "metros2pes",
    aliases: ["metros2pes-cmd","cmd-metros2pes"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Metros para Pés: .metros2pes 1.80",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const m = parseFloat(args[0]);
            if (isNaN(m) || m < 0) return reply("❌ Digite a medida em metros.");
            const ft = m * 3.28084;
            return reply(`📏 *${m} m* = *${ft.toFixed(2)} pés (ft)*`);
        }
};
