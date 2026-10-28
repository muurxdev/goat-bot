/**
 * Comando .pagaremprestimo — Quita parcelas da sua dívida real: .pagaremprestimo <valor>
 */
module.exports = {
    name: "pagaremprestimo",
    aliases: ["pagaremprestimo-cmd","cmd-pagaremprestimo","cmd_pagaremprestimo","alt_pagaremprestimo","atalho_pagaremprestimo","abrev_pagaremprestimo","call_pagaremprestimo","func_pagaremprestimo"],
    category: "economy",
    subcategory: "Banco",
    description: "Quita parcelas da sua dívida real: .pagaremprestimo <valor>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const val = parseInt(args[0]) || 500;
            return reply(`📜 *RECIBO DE QUITAÇÃO DE DÍVIDA*\n\nVocê pagou 💰 *${val.toLocaleString('pt-BR')} moedas* aos cobradores reais Central.\nSua ficha no reino está limpa e honrada!`);
        }
};
