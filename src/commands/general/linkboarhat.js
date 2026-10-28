/**
 * Comando .linkboarhat — Exibe cartão temático de convite para a guilda: .linkboarhat
 */
module.exports = {
    name: "linkboarhat",
    aliases: ["linkboarhat-cmd","cmd-linkboarhat"],
    category: "general",
    subcategory: "Convite",
    description: "Exibe cartão temático de convite para a guilda: .linkboarhat",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🍺🐷 *BOAR HAT TAVERN — CONVITE OFICIAL*\n\nA taverna itinerante mais animada do Reino está com as portas abertas!\nVenha tomar uma cerveja gelada de Bernia e participar das nossas caçadas!");
        }
};
