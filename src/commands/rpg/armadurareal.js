/**
 * Comando .armadurareal — Examina uma Armadura Sagrada de Platina Central: .armadurareal
 */
module.exports = {
    name: "armadurareal",
    aliases: ["armadurareal-cmd","cmd-armadurareal"],
    category: "rpg",
    subcategory: "Equipamento",
    description: "Examina uma Armadura Sagrada de Platina Central: .armadurareal",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🛡️ *ARMADURA SAGRADA DE PLATINA*\n\n▫️ Forjada com aço encantado das minas do Reino\n▫️ *Resistência Mágica:* +40%\n▫️ *Defesa Física:* +180\n▫️ Usada apenas pelos Cavaleiros Sagrados de Rank Diamante.`);
        }
};
