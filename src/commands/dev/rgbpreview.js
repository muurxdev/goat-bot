/**
 * Comando .rgbpreview — Mostra esquema de cor CSS formatado: .rgbpreview <r> <g> <b>
 */
module.exports = {
    name: "rgbpreview",
    aliases: ["rgbpreview-cmd","cmd-rgbpreview","cmd_rgbpreview","alt_rgbpreview","atalho_rgbpreview","abrev_rgbpreview","call_rgbpreview","func_rgbpreview"],
    category: "dev",
    subcategory: "Cores",
    description: "Mostra esquema de cor CSS formatado: .rgbpreview <r> <g> <b>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const [r, g, b] = args.slice(0, 3).map(Number);
            if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) return reply("Uso: `.rgbpreview <0-255> <0-255> <0-255>`");
            return reply(`🎨 *Cor CSS:*\n▫️ \`rgb(${r}, ${g}, ${b})\`\n▫️ \`rgba(${r}, ${g}, ${b}, 1.0)\`\n▫️ HEX: \`#${[r,g,b].map(x => x.toString(16).padStart(2,'0')).join('').toUpperCase()}\``);
        }
};
