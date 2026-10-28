/**
 * Comando .colorrgb2hex — Converte cor RGB para Hexadecimal: .colorrgb2hex 255 87 51
 */
module.exports = {
    name: "colorrgb2hex",
    aliases: ["colorrgb2hex-cmd","cmd-colorrgb2hex","cmd_colorrgb2hex","alt_colorrgb2hex","atalho_colorrgb2hex","abrev_colorrgb2hex","call_colorrgb2hex","func_colorrgb2hex"],
    category: "dev",
    subcategory: "Cores",
    description: "Converte cor RGB para Hexadecimal: .colorrgb2hex 255 87 51",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 3) return reply("Uso: `.colorrgb2hex <r> <g> <b>`");
            const [r, g, b] = args.slice(0, 3).map(Number);
            if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) return reply("❌ Valores RGB devem estar entre 0 e 255.");
            const toHex = n => n.toString(16).padStart(2, "0").toUpperCase();
            return reply(`🎨 *Conversão de Cor:*\nRGB: rgb(${r}, ${g}, ${b})\nHEX: *#${toHex(r)}${toHex(g)}${toHex(b)}*`);
        }
};
