/**
 * Comando .tesouronacional — Consulta o cofre da reserva soberana do Reino: .tesouronacional
 */
module.exports = {
    name: "tesouronacional",
    aliases: ["tesouronacional-cmd","cmd-tesouronacional","cmd_tesouronacional","alt_tesouronacional","atalho_tesouronacional","abrev_tesouronacional","call_tesouronacional","func_tesouronacional"],
    category: "economy",
    subcategory: "Status",
    description: "Consulta o cofre da reserva soberana do Reino: .tesouronacional",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`👑 *RESERVA SOBERANA DE REINO*\n\n▫️ Ouro em custódia: 14.850.000 Moedas de Ouro\n▫️ Barras de Mithril: 4.200 barras\n▫️ Gemas Elementares: 1.890 pedras\n▫️ Protegido pelos Cavaleiros Sagrados Central.`);
        }
};
