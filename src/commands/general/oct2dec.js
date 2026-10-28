/**
 * Comando .oct2dec — Converte octal para decimal: .oct2dec 77
 */
module.exports = {
    name: "oct2dec",
    aliases: ["oct2dec-cmd","cmd-oct2dec"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte octal para decimal: .oct2dec 77",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const o = (args[0] || "").trim();
            if (!/^[0-7]+$/.test(o)) return reply("❌ Digite um valor octal válido (dígitos 0 a 7). Ex: `.oct2dec 75`");
            return reply(`🔢 *Octal:* ${o}\nDecimal: *${parseInt(o, 8)}*`);
        }
};
