/**
 * Comando .det2x2 — Determinante de matriz 2x2: .det2x2 a b c d
 */
module.exports = {
    name: "det2x2",
    aliases: ["det2x2-cmd","cmd-det2x2"],
    category: "general",
    subcategory: "Álgebra",
    description: "Determinante de matriz 2x2: .det2x2 a b c d",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 4) return reply("📐 *Determinante 2x2*\nUso: `.det2x2 a b c d`\n[ a  b ]\n[ c  d ]");
            const a = parseFloat(args[0]), b = parseFloat(args[1]), c = parseFloat(args[2]), d = parseFloat(args[3]);
            if ([a, b, c, d].some(isNaN)) return reply("❌ Todos os 4 valores devem ser números.");
            const det = (a * d) - (b * c);
            return reply(`📐 *Determinante:*\n| ${a}  ${b} |\n| ${c}  ${d} |\n\nResultado: *det = ${det}*`);
        }
};
