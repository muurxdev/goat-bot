/**
 * Comando .lagodeceleste — Visita o Lago Sagrado de Pajos: .lagodeceleste
 */
module.exports = {
    name: "lagodeceleste",
    aliases: ["lagodeceleste-cmd","cmd-lagodeceleste"],
    category: "rpg",
    subcategory: "Local",
    description: "Visita o Lago Sagrado de Pajos: .lagodeceleste",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🌊 *LAGO SAGRADO DE PAJOS*\n\n▫️ Águas cristalinas e mágicas conhecidas por refratar a energia da terra.\n▫️ Local onde os Cavaleiros Sagrados purificam suas armas e recebem a bênção do vento.`);
        }
};
