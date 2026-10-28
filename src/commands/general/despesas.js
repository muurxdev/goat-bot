/**
 * Comando .despesas — Soma uma lista de despesas: .despesas 15.50 30 120 4.90
 */
module.exports = {
    name: "despesas",
    aliases: ["despesas-cmd","cmd-despesas"],
    category: "general",
    subcategory: "Finanças",
    description: "Soma uma lista de despesas: .despesas 15.50 30 120 4.90",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const vals = args.map(v => parseFloat(v.replace(',', '.'))).filter(v => !isNaN(v));
            if (vals.length === 0) return reply("🧾 *Calculadora de Despesas*\nUso: `.despesas <item1> <item2> ...`\nEx: `.despesas 25.50 14 89.90`");
            const total = vals.reduce((a, b) => a + b, 0);
            return reply(`🧾 *Total de Despesas (${vals.length} itens):*\n💰 *R$ ${total.toFixed(2)}*`);
        }
};
