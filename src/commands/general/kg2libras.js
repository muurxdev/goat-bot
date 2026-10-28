/**
 * Comando .kg2libras — Converte Quilos para Libras: .kg2libras 70
 */
module.exports = {
    name: "kg2libras",
    aliases: ["kg2libras-cmd","cmd-kg2libras"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Quilos para Libras: .kg2libras 70",
    cooldownMs: 1000,
    execute: async ({ reply, args }) => {
            const kg = parseFloat(args[0]);
            if (isNaN(kg) || kg < 0) return reply("❌ Digite o peso em kg.");
            const lb = kg * 2.20462;
            return reply(`⚖️ *${kg} kg* = *${lb.toFixed(2)} lbs*`);
        }
};
