/**
 * Comando .honrareal — Consulta seus pontos de honra perante o conselho real: .honrareal
 */
module.exports = {
    name: "honrareal",
    aliases: ["honrareal-cmd","cmd-honrareal"],
    category: "profile",
    subcategory: "Status",
    description: "Consulta seus pontos de honra perante o conselho real: .honrareal",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const h = Math.floor(Math.random() * 800) + 200;
            return reply(`🛡️ *PONTOS DE HONRA REAL*\n\n▫️ Saldo atual: *${h} Honras Reais*\n▫️ Patente: Cavaleiro de Primeira Classe\n▫️ Vantagem: Desconto de 10% nas forjas oficiais.`);
        }
};
