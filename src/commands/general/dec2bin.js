/**
 * Comando .dec2bin — Converte decimal para binário: .dec2bin 42
 */
module.exports = {
    name: "dec2bin",
    aliases: ["dec2bin-cmd","cmd-dec2bin"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte decimal para binário: .dec2bin 42",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const d = parseInt(args[0]);
            if (isNaN(d) || d < 0) return reply("❌ Digite um número inteiro positivo. Ex: `.dec2bin 42`");
            return reply(`🔢 *Decimal:* ${d}\nBinário: *${d.toString(2)}*`);
        }
};
