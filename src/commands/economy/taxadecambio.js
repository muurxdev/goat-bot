/**
 * Comando .taxadecambio — Converte valores entre moedas de diferentes reinos: .taxadecambio <valor> <reino>
 */
module.exports = {
    name: "taxadecambio",
    aliases: ["taxadecambio-cmd","cmd-taxadecambio","cmd_taxadecambio","alt_taxadecambio","atalho_taxadecambio","abrev_taxadecambio","call_taxadecambio","func_taxadecambio"],
    category: "economy",
    subcategory: "Mercado",
    description: "Converte valores entre moedas de diferentes reinos: .taxadecambio <valor> <reino>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const v = parseFloat(args[0]) || 100;
            const reino = (args[1] || "Cidade Dourada").toLowerCase();
            let taxa = 1.15;
            if (reino.includes("fada")) taxa = 2.4;
            if (reino.includes("inferno")) taxa = 0.6;
            return reply(`💱 *CÂMBIO INTER-REINOS*\n\n▫️ Valor base: ${v} Ouros Central\n▫️ Destino: ${reino}\n▫️ Equivalente: *${(v * taxa).toFixed(2)} moedas locais* (Taxa: ${taxa}x)`);
        }
};
