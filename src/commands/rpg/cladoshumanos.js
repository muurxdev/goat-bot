/**
 * Comando .cladoshumanos — Consulta a linhagem e Cavaleiros Sagrados dos Humanos: .cladoshumanos
 */
module.exports = {
    name: "cladoshumanos",
    aliases: ["cladoshumanos-cmd","cmd-cladoshumanos"],
    category: "rpg",
    subcategory: "Lore",
    description: "Consulta a linhagem e Cavaleiros Sagrados dos Humanos: .cladoshumanos",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🛡️ *CLÃ DOS HUMANOS (Reino)*\n\n▫️ *Reinos:* Reino Central, Cidade Dourada, Vilarejo\n▫️ *Elite:* Cavaleiros Sagrados (Grão-Mestres Zaratras, Ferreiro, Sábio)\n▫️ *Heróis Lendários:* Ban (o Morto-Vivo), Rei Arthur Pendragon (Rei do Caos)\n▫️ *Potencial Oculto:* Apesar de vidas curtas, carregam a centelha do livre arbítrio e do Caos ancestral.`);
        }
};
