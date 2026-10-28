/**
 * Comando .milhas2km — Converte Milhas para Quilômetros: .milhas2km 60
 */
module.exports = {
    name: "milhas2km",
    aliases: ["milhas2km-cmd","cmd-milhas2km"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Milhas para Quilômetros: .milhas2km 60",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const mi = parseFloat(args[0]);
            if (isNaN(mi) || mi < 0) return reply("❌ Digite a distância em milhas.");
            const km = mi / 0.621371;
            return reply(`🚗 *${mi} milhas* = *${km.toFixed(2)} km*`);
        }
};
