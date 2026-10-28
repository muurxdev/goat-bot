/**
 * Comando .cladosgigantes — Consulta o conhecimento e rituais da Megadozer do Clã dos Gigantes: .cladosgigantes
 */
module.exports = {
    name: "cladosgigantes",
    aliases: ["cladosgigantes-cmd","cmd-cladosgigantes"],
    category: "rpg",
    subcategory: "Lore",
    description: "Consulta o conhecimento e rituais da Megadozer do Clã dos Gigantes: .cladosgigantes",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏔️ *CLÃ DOS GIGANTES (Megadozer)*\n\n▫️ *Terra de Origem:* Megadozer\n▫️ *Líderes Notáveis:* Drole (Balor), Matrona, Guerreira\n▫️ *Habilidade Natural:* *Creation* (Manipulação pura da terra, rochas e metais)\n▫️ *Dança de Drole:* Sintoniza a terra para amplificar a força e conexão geológica.\n▫️ *Orgulho dos Guerreiros:* Jamais recuam em um combate corporal honrado!`);
        }
};
