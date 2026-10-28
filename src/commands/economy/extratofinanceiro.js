/**
 * Comando .extratofinanceiro — Imprime extrato de movimentações financeiras recentes: .extratofinanceiro
 */
module.exports = {
    name: "extratofinanceiro",
    aliases: ["extratofinanceiro-cmd","cmd-extratofinanceiro","cmd_extratofinanceiro","alt_extratofinanceiro","atalho_extratofinanceiro","abrev_extratofinanceiro","call_extratofinanceiro","func_extratofinanceiro"],
    category: "economy",
    subcategory: "Banco",
    description: "Imprime extrato de movimentações financeiras recentes: .extratofinanceiro",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`📜 *EXTRATO DE MOVIMENTAÇÃO*\n\n[+] 💰 +500 (Recompensa de Caçada)\n[-] 💰 -80 (Canecas de Cerveja de Bernia)\n[+] 💰 +1.200 (Venda de Minérios em Torre)\n[-] 💰 -150 (Manutenção de Armadura)\n\nSaldo consolidado e auditado.`);
        }
};
