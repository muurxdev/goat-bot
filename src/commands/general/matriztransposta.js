/**
 * Comando .matriztransposta — Transpõe matriz 2x2: .matriztransposta a b c d
 */
module.exports = {
    name: "matriztransposta",
    aliases: ["matriztransposta-cmd","cmd-matriztransposta"],
    category: "general",
    subcategory: "Álgebra",
    description: "Transpõe matriz 2x2: .matriztransposta a b c d",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 4) return reply("📐 *Transposição 2x2*\nUso: `.matriztransposta a b c d` (onde Linha 1 = a b, Linha 2 = c d)");
            const [a, b, c, d] = args.slice(0, 4);
            return reply(`📐 *Matriz Original:*\n[ ${a}  ${b} ]\n[ ${c}  ${d} ]\n\n🔄 *Matriz Transposta:*\n[ ${a}  ${c} ]\n[ ${b}  ${d} ]`);
        }
};
