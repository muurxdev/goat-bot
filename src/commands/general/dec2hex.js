/**
 * Comando .dec2hex — Converte decimal para hexadecimal: .dec2hex 255
 */
module.exports = {
    name: "dec2hex",
    aliases: ["dec2hex-cmd","cmd-dec2hex"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte decimal para hexadecimal: .dec2hex 255",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const d = parseInt(args[0]);
            if (isNaN(d) || d < 0) return reply("❌ Digite um número inteiro positivo. Ex: `.dec2hex 255`");
            return reply(`🔢 *Decimal:* ${d}\nHexadecimal: *0x${d.toString(16).toUpperCase()}*`);
        }
};
