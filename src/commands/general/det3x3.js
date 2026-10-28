/**
 * Comando .det3x3 — Determinante de matriz 3x3 por Sarrus: .det3x3 a b c d e f g h i
 */
module.exports = {
    name: "det3x3",
    aliases: ["det3x3-cmd","cmd-det3x3"],
    category: "general",
    subcategory: "Álgebra",
    description: "Determinante de matriz 3x3 por Sarrus: .det3x3 a b c d e f g h i",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 9) return reply("📐 *Determinante 3x3 (Regra de Sarrus)*\nUso: `.det3x3 a b c d e f g h i` (9 números em sequência)");
            const [a, b, c, d, e, f, g, h, i] = args.slice(0, 9).map(Number);
            if ([a, b, c, d, e, f, g, h, i].some(isNaN)) return reply("❌ Todos os 9 valores devem ser números.");
            const det = (a * e * i + b * f * g + c * d * h) - (c * e * g + a * f * h + b * d * i);
            return reply(`📐 *Determinante 3x3:*\n| ${a}  ${b}  ${c} |\n| ${d}  ${e}  ${f} |\n| ${g}  ${h}  ${i} |\n\nResultado: *det = ${det}*`);
        }
};
