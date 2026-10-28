/**
 * Comando .libras2kg — Converte Libras para Quilos: .libras2kg 150
 */
module.exports = {
    name: "libras2kg",
    aliases: ["libras2kg-cmd","cmd-libras2kg"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Libras para Quilos: .libras2kg 150",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const lb = parseFloat(args[0]);
            if (isNaN(lb) || lb < 0) return reply("❌ Digite o peso em libras.");
            const kg = lb / 2.20462;
            return reply(`⚖️ *${lb} lbs* = *${kg.toFixed(2)} kg*`);
        }
};
