/**
 * Comando .colorhex2rgb — Converte cor Hexadecimal para RGB: .colorhex2rgb #FF5733
 */
module.exports = {
    name: "colorhex2rgb",
    aliases: ["colorhex2rgb-cmd","cmd-colorhex2rgb","cmd_colorhex2rgb","alt_colorhex2rgb","atalho_colorhex2rgb","abrev_colorhex2rgb","call_colorhex2rgb","func_colorhex2rgb"],
    category: "dev",
    subcategory: "Cores",
    description: "Converte cor Hexadecimal para RGB: .colorhex2rgb #FF5733",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            let hex = (args[0] || "").replace("#", "");
            if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
            if (hex.length !== 6) return reply("Uso: `.colorhex2rgb <#HEX>`\nEx: `.colorhex2rgb #FF5733`");
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return reply(`🎨 *Conversão de Cor:*\nHEX: #${hex.toUpperCase()}\nRGB: *rgb(${r}, ${g}, ${b})*`);
        }
};
