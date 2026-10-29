/**
 * Comando .coliseubaste — Explora as ruínas da Prisão de Baste: .coliseubaste
 */
module.exports = {
    name: "coliseubaste",
    aliases: ["coliseubaste-cmd","cmd-coliseubaste"],
    category: "rpg",
    subcategory: "Local",
    description: "Explora as ruínas da Prisão de Baste: .coliseubaste",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`⛓️ *MASMORRA DE BASTE*\n\n▫️ Onde Ban esteve aprisionado e cravado com estacas de aço pelos Weird Fangs.\n▫️ Suas muralhas foram destruídas na épica queda de braço entre ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ e Ban!`);
        }
};
