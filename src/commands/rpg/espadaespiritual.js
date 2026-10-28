/**
 * Comando .espadaespiritual — Manifesta a Lâmina Sagrada de Excalibur de Arthur: .espadaespiritual
 */
module.exports = {
    name: "espadaespiritual",
    aliases: ["espadaespiritual-cmd","cmd-espadaespiritual"],
    category: "rpg",
    subcategory: "Armas",
    description: "Manifesta a Lâmina Sagrada de Excalibur de Arthur: .espadaespiritual",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`👑 *ESPADA SAGRADA: EXCALIBUR*\n\n▫️ A espada cravada com a alma de todos os heróis lendários que governaram a Reino.\n▫️ Carrega o destino do Rei Escolhido pelo Caos Primordial!`);
        }
};
