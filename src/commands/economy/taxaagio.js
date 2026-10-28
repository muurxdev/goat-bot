/**
 * Comando .taxaagio — Calcula a taxa de ágio em negociações mercantis: .taxaagio <preco_base> <preco_venda>
 */
module.exports = {
    name: "taxaagio",
    aliases: ["taxaagio-cmd","cmd-taxaagio","cmd_taxaagio","alt_taxaagio","atalho_taxaagio","abrev_taxaagio","call_taxaagio","func_taxaagio"],
    category: "economy",
    subcategory: "Finanças",
    description: "Calcula a taxa de ágio em negociações mercantis: .taxaagio <preco_base> <preco_venda>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const b = parseFloat(args[0]), v = parseFloat(args[1]);
            if (isNaN(b) || isNaN(v) || b <= 0) return reply("Uso: `.taxaagio <preco_base> <preco_venda>`");
            const agio = ((v - b) / b) * 100;
            return reply(`📊 *Cálculo de Ágio / Lucro:*\n▫️ Base: ${b}\n▫️ Venda: ${v}\n▫️ *Margem de Ágio:* *${agio.toFixed(2)}%*`);
        }
};
