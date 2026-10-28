/**
 * Comando .martelogideon — História do Martelo Gigante Sagrado de Guerreira: .martelogideon
 */
module.exports = {
    name: "martelogideon",
    aliases: ["martelogideon-cmd","cmd-martelogideon"],
    category: "rpg",
    subcategory: "Lore",
    description: "História do Martelo Gigante Sagrado de Guerreira: .martelogideon",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🔨 *MARTELO SAGRADO SAGRADO*\n\n▫️ Um martelo de guerra gigante pesando mais de 1.000 kg!\n▫️ Feito de material mineral capaz de absorver a força de ataques da terra e redirecionar em terremotos massivos (Mother Catastrophe).`);
        }
};
