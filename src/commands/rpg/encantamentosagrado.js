/**
 * Comando .encantamentosagrado — Entoa um encantamento de proteção do Reino: .encantamentosagrado
 */
module.exports = {
    name: "encantamentosagrado",
    aliases: ["encantamentosagrado-cmd","cmd-encantamentosagrado"],
    category: "rpg",
    subcategory: "Magia",
    description: "Entoa um encantamento de proteção do Reino: .encantamentosagrado",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`✨ *PERFECTION CUBE (Cubo Perfeito)*\n\nUm feitiço secreto do Mundo Demoníaco que nega qualquer ataque físico ou mágico.\nNão importa o quão forte seja o golpe, ele será refletido de volta com a mesma intensidade!`);
        }
};
