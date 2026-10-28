/**
 * Comando .veracoes — Visualiza os índices de mercado das guildas mercantes: .veracoes
 */
module.exports = {
    name: "veracoes",
    aliases: ["veracoes-cmd","cmd-veracoes","cmd_veracoes","alt_veracoes","atalho_veracoes","abrev_veracoes","call_veracoes","func_veracoes"],
    category: "economy",
    subcategory: "Investimento",
    description: "Visualiza os índices de mercado das guildas mercantes: .veracoes",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`📊 *ÍNDICE DAS GUILDAS MERCANTES*\n\n🍺 [HAT] Javali Taverns: R$ 142.50 (+3.4%)\n⚔️ [LION] Cavaleiros Sagrados Armas: R$ 89.20 (-1.2%)\n🧚 [FAIR] Néctar da Floresta Sagrada: R$ 320.10 (+8.7%)\n🔮 [MERL] Artefatos de Belialuin: R$ 512.00 (+0.5%)\n⛏️ [MINE] Mineração de Torre: R$ 45.80 (-4.1%)`);
        }
};
