/**
 * Comando .dec2oct — Converte decimal para octal: .dec2oct 63
 */
module.exports = {
    name: "dec2oct",
    aliases: ["dec2oct-cmd","cmd-dec2oct"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte decimal para octal: .dec2oct 63",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const d = parseInt(args[0]);
            if (isNaN(d) || d < 0) return reply("❌ Digite um número inteiro positivo.");
            return reply(`🔢 *Decimal:* ${d}\nOctal: *${d.toString(8)}*`);
        }
};
