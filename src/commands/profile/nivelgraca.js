/**
 * Comando .nivelgraca — Consulta o grau de ressonância com as 4 Graças Celestiais: .nivelgraca
 */
module.exports = {
    name: "nivelgraca",
    aliases: ["nivelgraca-cmd","cmd-nivelgraca"],
    category: "profile",
    subcategory: "Status",
    description: "Consulta o grau de ressonância com as 4 Graças Celestiais: .nivelgraca",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🪽 *RESSONÂNCIA CELESTIAL*\n\n▫️ Graça do Sol: 45%\n▫️ Graça do Oceano: 70%\n▫️ Graça do Tornado: 55%\n▫️ Graça do Relâmpago Flash: 85%");
        }
};
