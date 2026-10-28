/**
 * Comando .medidaarea — Converte Metros Quadrados para Hectares: .medidaarea <m2>
 */
module.exports = {
    name: "medidaarea",
    aliases: ["medidaarea-cmd","cmd-medidaarea"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Metros Quadrados para Hectares: .medidaarea <m2>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const m2 = parseFloat(args[0]);
            if (isNaN(m2) || m2 < 0) return reply("Uso: `.medidaarea <metros_quadrados>`");
            const ha = m2 / 10000;
            return reply(`📐 *Área:* ${m2} m²\n▫️ Hectares: *${ha.toFixed(4)} ha*`);
        }
};
