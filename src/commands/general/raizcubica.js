/**
 * Comando .raizcubica — Calcula raiz cúbica: .raizcubica <n>
 */
module.exports = {
    name: "raizcubica",
    aliases: ["raizcubica-cmd","cmd-raizcubica"],
    category: "general",
    subcategory: "Matemática",
    description: "Calcula raiz cúbica: .raizcubica <n>",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const n = parseFloat(args[0]);
            if (isNaN(n)) return reply("❌ Digite um número válido. Ex: `.raizcubica 27`");
            return reply(`∛${n} = *${Math.cbrt(n).toFixed(4)}*`);
        }
};
