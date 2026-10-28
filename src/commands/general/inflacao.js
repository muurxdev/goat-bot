/**
 * Comando .inflacao — Projeção de valor com inflação acumulada: .inflacao <valor> <taxa_anual%> <anos>
 */
module.exports = {
    name: "inflacao",
    aliases: ["inflacao-cmd","cmd-inflacao"],
    category: "general",
    subcategory: "Finanças",
    description: "Projeção de valor com inflação acumulada: .inflacao <valor> <taxa_anual%> <anos>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 3) return reply("📈 *Projeção de Inflação*\nUso: `.inflacao <valor> <taxa_anual%> <anos>`\nEx: `.inflacao 1000 5.5 5`");
            const v = parseFloat(args[0]), t = parseFloat(args[1]) / 100, anos = parseFloat(args[2]);
            if (isNaN(v) || isNaN(t) || isNaN(anos)) return reply("❌ Valores inválidos.");
            const futuro = v * Math.pow(1 + t, anos);
            return reply(`📈 *Efeito da Inflação:*\n▫️ Valor atual: R$ ${v.toFixed(2)}\n▫️ Inflação anual: ${(t * 100).toFixed(2)}%\n▫️ Anos: ${anos}\n▫️ *Poder de compra equivalente futuro:* *R$ ${futuro.toFixed(2)}*`);
        }
};
