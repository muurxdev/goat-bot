/**
 * Comando .fahrenheit2celsius — Converte Fahrenheit para Celsius: .fahrenheit2celsius 80
 */
module.exports = {
    name: "fahrenheit2celsius",
    aliases: ["fahrenheit2celsius-cmd","cmd-fahrenheit2celsius"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Fahrenheit para Celsius: .fahrenheit2celsius 80",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const f = parseFloat(args[0]);
            if (isNaN(f)) return reply("❌ Digite a temperatura em Fahrenheit. Ex: `.fahrenheit2celsius 77`");
            const c = (f - 32) * 5 / 9;
            return reply(`🌡️ *${f}°F* = *${c.toFixed(2)}°C*`);
        }
};
