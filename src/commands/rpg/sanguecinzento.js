/**
 * Comando .sanguecinzento — Examina as propriedades do Sangue de Demônio Cinza: .sanguecinzento
 */
module.exports = {
    name: "sanguecinzento",
    aliases: ["sanguecinzento-cmd","cmd-sanguecinzento"],
    category: "rpg",
    subcategory: "Mutação",
    description: "Examina as propriedades do Sangue de Demônio Cinza: .sanguecinzento",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`💉 *SANGUE DE DEMÔNIO CINZA*\n\n▫️ Injetado por Ferreiro para transformar a Nova Geração de Cavaleiros Sagrados.\n▫️ Concede asas e força grotesca, mas consome o corpo se a mente não for forte o suficiente.`);
        }
};
