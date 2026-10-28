/**
 * Comando .fontedajuventude — A história mística da Fonte da Juventude: .fontedajuventude
 */
module.exports = {
    name: "fontedajuventude",
    aliases: ["fontedajuventude-cmd","cmd-fontedajuventude"],
    category: "rpg",
    subcategory: "Lore",
    description: "A história mística da Fonte da Juventude: .fontedajuventude",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🕊️ *FONTE DA JUVENTUDE*\n\n▫️ Situada no topo da Árvore Sagrada.\n▫️ Fonte de vida que mantinha toda a floresta das fadas imortal e florescendo por milênios.`);
        }
};
