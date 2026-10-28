/**
 * Comando .colorrgb2hsl — Converte cor RGB para HSL: .colorrgb2hsl 255 0 0
 */
module.exports = {
    name: "colorrgb2hsl",
    aliases: ["colorrgb2hsl-cmd","cmd-colorrgb2hsl","cmd_colorrgb2hsl","alt_colorrgb2hsl","atalho_colorrgb2hsl","abrev_colorrgb2hsl","call_colorrgb2hsl","func_colorrgb2hsl"],
    category: "dev",
    subcategory: "Cores",
    description: "Converte cor RGB para HSL: .colorrgb2hsl 255 0 0",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 3) return reply("Uso: `.colorrgb2hsl <r> <g> <b>`");
            let [r, g, b] = args.slice(0, 3).map(Number);
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return reply(`🎨 *HSL:* *hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)*`);
        }
};
