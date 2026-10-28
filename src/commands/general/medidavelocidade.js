/**
 * Comando .medidavelocidade — Converte km/h para m/s e nós náuticos: .medidavelocidade <kmh>
 */
module.exports = {
    name: "medidavelocidade",
    aliases: ["medidavelocidade-cmd","cmd-medidavelocidade"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte km/h para m/s e nós náuticos: .medidavelocidade <kmh>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const kmh = parseFloat(args[0]);
            if (isNaN(kmh) || kmh < 0) return reply("Uso: `.medidavelocidade <km_por_hora>`");
            const ms = kmh / 3.6;
            const knots = kmh * 0.539957;
            return reply(`⚡ *Velocidade:* ${kmh} km/h\n▫️ Metros por segundo: *${ms.toFixed(2)} m/s*\n▫️ Nós náuticos: *${knots.toFixed(2)} knots*`);
        }
};
