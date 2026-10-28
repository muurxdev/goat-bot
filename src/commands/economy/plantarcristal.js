/**
 * Comando .plantarcristal — Planta uma muda de cristal de mana no jardim do Javali: .plantarcristal
 */
module.exports = {
    name: "plantarcristal",
    aliases: ["plantarcristal-cmd","cmd-plantarcristal","cmd_plantarcristal","alt_plantarcristal","atalho_plantarcristal","abrev_plantarcristal","call_plantarcristal","func_plantarcristal"],
    category: "economy",
    subcategory: "Cultivo",
    description: "Planta uma muda de cristal de mana no jardim do Javali: .plantarcristal",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply(`🌱💎 *CULTIVO DE CRISTAIS*\n\nVocê plantou a semente de cristal no solo abençoado!\nEla absorverá a luz lunar para germinar. Use \`.colhercristal\` mais tarde!`);
        }
};
