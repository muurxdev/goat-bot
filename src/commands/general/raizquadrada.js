/**
 * Comando .raizquadrada — Calcula raiz quadrada: .raizquadrada <n>
 */
module.exports = {
    name: "raizquadrada",
    aliases: ["raizquadrada-cmd","cmd-raizquadrada"],
    category: "general",
    subcategory: "Matemática",
    description: "Calcula raiz quadrada: .raizquadrada <n>",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const n = parseFloat(args[0]);
            if (isNaN(n) || n < 0) return reply("❌ Digite um número positivo. Ex: `.raizquadrada 144`");
            return reply(`√${n} = *${Math.sqrt(n).toFixed(4)}*`);
        }
};
