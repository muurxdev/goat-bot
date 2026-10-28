/**
 * Comando .nivelamizade — Consulta o nível de amizade com a tripulação do Javali: .nivelamizade
 */
module.exports = {
    name: "nivelamizade",
    aliases: ["nivelamizade-cmd","cmd-nivelamizade"],
    category: "profile",
    subcategory: "Social",
    description: "Consulta o nível de amizade com a tripulação do Javali: .nivelamizade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🍺 *VÍNCULOS NA TAVERNA*\n\n▫️ GOAT: Nível 8 (Parceiro de caneca)\n▫️ Princesa: Nível 9 (Confiança mútua)\n▫️ Guardião: Nível 10 (Melhor alimentador de sobras)\n▫️ Ban: Nível 7 (Rival de braço de ferro)\n▫️ King: Nível 6 (Cuidado com o travesseiro)");
        }
};
