/**
 * Comando .cotacaomagic — Consulta a cotação das moedas mágicas do Reino: .cotacaomagic
 */
module.exports = {
    name: "cotacaomagic",
    aliases: ["cotacaomagic-cmd","cmd-cotacaomagic","cmd_cotacaomagic","alt_cotacaomagic","atalho_cotacaomagic","abrev_cotacaomagic","call_cotacaomagic","func_cotacaomagic"],
    category: "economy",
    subcategory: "Mercado",
    description: "Consulta a cotação das moedas mágicas do Reino: .cotacaomagic",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`💱 *CÂMBIO DE CRISTAIS E MOEDAS*\n\n▫️ 1 Cristal de Mana = 💰 250 Ouros\n▫️ 1 Moeda de Platina = 💰 100 Ouros\n▫️ 1 Fragmento de Purgatório = 💰 1.200 Ouros\n▫️ 1 Lágrima de Fada = 💰 850 Ouros`);
        }
};
