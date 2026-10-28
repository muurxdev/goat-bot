/**
 * Comando .km2milhas — Converte Quilômetros para Milhas: .km2milhas 100
 */
module.exports = {
    name: "km2milhas",
    aliases: ["km2milhas-cmd","cmd-km2milhas"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Quilômetros para Milhas: .km2milhas 100",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const km = parseFloat(args[0]);
            if (isNaN(km) || km < 0) return reply("❌ Digite a distância em km.");
            const mi = km * 0.621371;
            return reply(`🚗 *${km} km* = *${mi.toFixed(2)} milhas*`);
        }
};
