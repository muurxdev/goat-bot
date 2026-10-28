/**
 * Comando .tangente — Calcula a tangente de um ângulo em graus: .tangente <graus>
 */
module.exports = {
    name: "tangente",
    aliases: ["tangente-cmd","cmd-tangente"],
    category: "general",
    subcategory: "Trigonometria",
    description: "Calcula a tangente de um ângulo em graus: .tangente <graus>",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const deg = parseFloat(args[0]);
            if (isNaN(deg)) return reply("❌ Digite o ângulo em graus. Ex: `.tangente 45`");
            if (Math.abs(deg % 180) === 90) return reply("❌ Tangente indefinida para 90°, 270°, etc.");
            const rad = deg * (Math.PI / 180);
            return reply(`📐 *tg(${deg}°)* = *${Math.tan(rad).toFixed(4)}*`);
        }
};
