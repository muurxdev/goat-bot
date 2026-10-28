/**
 * Comando .hex2dec — Converte hexadecimal para decimal: .hex2dec 2A
 */
module.exports = {
    name: "hex2dec",
    aliases: ["hex2dec-cmd","cmd-hex2dec"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte hexadecimal para decimal: .hex2dec 2A",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const h = (args[0] || "").trim();
            if (!/^[0-9a-fA-F]+$/.test(h)) return reply("❌ Digite um valor hexadecimal válido. Ex: `.hex2dec FF`");
            return reply(`🔢 *Hexadecimal:* ${h.toUpperCase()}\nDecimal: *${parseInt(h, 16)}*`);
        }
};
