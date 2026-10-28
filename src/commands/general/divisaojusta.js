/**
 * Comando .divisaojusta — Divide conta entre pessoas com taxa de serviço: .divisaojusta <total> <pessoas> [taxa%]
 */
module.exports = {
    name: "divisaojusta",
    aliases: ["divisaojusta-cmd","cmd-divisaojusta"],
    category: "general",
    subcategory: "Finanças",
    description: "Divide conta entre pessoas com taxa de serviço: .divisaojusta <total> <pessoas> [taxa%]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("👥 *Divisão Justa de Conta*\nUso: `.divisaojusta <total> <num_pessoas> [taxa%]`\nEx: `.divisaojusta 300 4 10`");
            const total = parseFloat(args[0]), pessoas = parseInt(args[1]), taxa = parseFloat(args[2]) || 0;
            if (isNaN(total) || isNaN(pessoas) || pessoas <= 0) return reply("❌ Valores inválidos.");
            const comTaxa = total * (1 + (taxa / 100));
            const porPessoa = comTaxa / pessoas;
            return reply(`👥 *Divisão da Conta:*\n▫️ Subtotal: R$ ${total.toFixed(2)}\n▫️ Taxa de Serviço: ${taxa}%\n▫️ Total: R$ ${comTaxa.toFixed(2)}\n▫️ Pessoas: ${pessoas}\n▫️ *Cada um paga:* *R$ ${porPessoa.toFixed(2)}*`);
        }
};
