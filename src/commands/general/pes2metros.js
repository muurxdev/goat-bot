/**
 * Comando .pes2metros — Converte Pés para Metros: .pes2metros 6
 */
module.exports = {
    name: "pes2metros",
    aliases: ["pes2metros-cmd","cmd-pes2metros"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Pés para Metros: .pes2metros 6",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const ft = parseFloat(args[0]);
            if (isNaN(ft) || ft < 0) return reply("❌ Digite a medida em pés.");
            const m = ft / 3.28084;
            return reply(`📏 *${ft} ft* = *${m.toFixed(2)} metros*`);
        }
};
