/**
 * Comando .consumocombustivel — Calcula consumo médio de combustível: .consumocombustivel <km_rodados> <litros>
 */
module.exports = {
    name: "consumocombustivel",
    aliases: ["consumocombustivel-cmd","cmd-consumocombustivel"],
    category: "general",
    subcategory: "Finanças",
    description: "Calcula consumo médio de combustível: .consumocombustivel <km_rodados> <litros>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("🚗 Uso: `.consumocombustivel <km_rodados> <litros_consumidos>`");
            const km = parseFloat(args[0]), l = parseFloat(args[1]);
            if (isNaN(km) || isNaN(l) || l <= 0) return reply("❌ Valores inválidos.");
            const media = km / l;
            return reply(`⛽ *Consumo Médio:*\nDistância: ${km} km\nCombustível: ${l} L\n▫️ *Rendimento:* *${media.toFixed(2)} km/litro*`);
        }
};
