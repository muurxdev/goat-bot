/**
 * Comando .bin2dec — Converte binário para decimal: .bin2dec 10110
 */
module.exports = {
    name: "bin2dec",
    aliases: ["bin2dec-cmd","cmd-bin2dec"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte binário para decimal: .bin2dec 10110",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const b = (args[0] || "").trim();
            if (!/^[01]+$/.test(b)) return reply("❌ Digite um valor binário válido (apenas 0 e 1). Ex: `.bin2dec 1101`");
            const d = parseInt(b, 2);
            return reply(`🔢 *Binário:* ${b}\nDecimal: *${d}*`);
        }
};
