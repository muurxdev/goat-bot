/**
 * Comando .formulanormal — Calcula força normal em plano horizontal: .formulanormal <massa> [gravidade]
 */
module.exports = {
    name: "formulanormal",
    aliases: ["formulanormal-cmd","cmd-formulanormal"],
    category: "general",
    subcategory: "Física",
    description: "Calcula força normal em plano horizontal: .formulanormal <massa> [gravidade]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const m = parseFloat(args[0]);
            const g = parseFloat(args[1]) || 9.81;
            if (isNaN(m) || m <= 0) return reply("⚛️ *Força Normal*\nUso: `.formulanormal <massa_kg> [gravidade_m/s²]`\nEx: `.formulanormal 50`");
            const n = m * g;
            return reply(`⚛️ *Força Normal (N = m · g)*\nMassa: ${m} kg\nGravidade: ${g} m/s²\nForça Normal: *${n.toFixed(2)} N*`);
        }
};
