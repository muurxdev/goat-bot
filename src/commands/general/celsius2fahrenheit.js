/**
 * Comando .celsius2fahrenheit — Converte Celsius para Fahrenheit: .celsius2fahrenheit 32
 */
module.exports = {
    name: "celsius2fahrenheit",
    aliases: ["celsius2fahrenheit-cmd","cmd-celsius2fahrenheit"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Celsius para Fahrenheit: .celsius2fahrenheit 32",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const c = parseFloat(args[0]);
            if (isNaN(c)) return reply("❌ Digite a temperatura em Celsius. Ex: `.celsius2fahrenheit 25`");
            const f = (c * 9 / 5) + 32;
            return reply(`🌡️ *${c}°C* = *${f.toFixed(2)}°F*`);
        }
};
