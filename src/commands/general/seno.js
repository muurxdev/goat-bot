/**
 * Comando .seno — Calcula o seno de um ângulo em graus: .seno <graus>
 */
module.exports = {
    name: "seno",
    aliases: ["seno-cmd","cmd-seno"],
    category: "general",
    subcategory: "Trigonometria",
    description: "Calcula o seno de um ângulo em graus: .seno <graus>",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const deg = parseFloat(args[0]);
            if (isNaN(deg)) return reply("❌ Digite o ângulo em graus. Ex: `.seno 30`");
            const rad = deg * (Math.PI / 180);
            return reply(`📐 *sen(${deg}°)* = *${Math.sin(rad).toFixed(4)}*`);
        }
};
