/**
 * Comando .bancosin — Acessa a conta corrente do Banco Central dos Sete Traços: .bancosin
 */
module.exports = {
    name: "bancosin",
    aliases: ["bancosin-cmd","cmd-bancosin","cmd_bancosin","alt_bancosin","atalho_bancosin","abrev_bancosin","call_bancosin","func_bancosin"],
    category: "economy",
    subcategory: "Banco",
    description: "Acessa a conta corrente do Banco Central dos Sete Traços: .bancosin",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏦 *BANCO CENTRAL DOS SETE TRAÇOS*\n\n▫️ Cliente de Rank Ouro\n▫️ Poupança: Rendimento de 0.8% a cada ciclo ativo\n▫️ Saque disponível a qualquer momento sem taxas em todas as tavernas credenciadas.`);
        }
};
