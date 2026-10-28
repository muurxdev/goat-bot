/**
 * Comando .cosseno — Calcula o cosseno de um ângulo em graus: .cosseno <graus>
 */
module.exports = {
    name: "cosseno",
    aliases: ["cosseno-cmd","cmd-cosseno"],
    category: "general",
    subcategory: "Trigonometria",
    description: "Calcula o cosseno de um ângulo em graus: .cosseno <graus>",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const deg = parseFloat(args[0]);
            if (isNaN(deg)) return reply("❌ Digite o ângulo em graus. Ex: `.cosseno 60`");
            const rad = deg * (Math.PI / 180);
            return reply(`📐 *cos(${deg}°)* = *${Math.cos(rad).toFixed(4)}*`);
        }
};
