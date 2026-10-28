/**
 * Comando .medidavolume — Converte Litros para Mililitros e Metros Cúbicos: .medidavolume <litros>
 */
module.exports = {
    name: "medidavolume",
    aliases: ["medidavolume-cmd","cmd-medidavolume"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Litros para Mililitros e Metros Cúbicos: .medidavolume <litros>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const l = parseFloat(args[0]);
            if (isNaN(l) || l < 0) return reply("Uso: `.medidavolume <litros>`");
            return reply(`🧪 *Volume:* ${l} L\n▫️ Mililitros: *${(l * 1000).toLocaleString('pt-BR')} mL*\n▫️ Metros Cúbicos: *${(l / 1000).toFixed(4)} m³*`);
        }
};
