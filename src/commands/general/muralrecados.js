/**
 * Comando .muralrecados — Consulta o mural de avisos da taverna: .muralrecados
 */
module.exports = {
    name: "muralrecados",
    aliases: ["muralrecados-cmd","cmd-muralrecados"],
    category: "general",
    subcategory: "Grupo",
    description: "Consulta o mural de avisos da taverna: .muralrecados",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("📌 *MURAL DE AVISOS DO BOAR HAT*\n\n▫️ \"Quem quebrou a mesa de bilhar deve pagar até o pôr do sol!\" — Ban\n▫️ \"Favor não dar cerveja ao Guardião!\" — Princesa\n▫️ \"Novas capas sagradas chegaram do ferreiro!\" — Guerreira");
        }
};
