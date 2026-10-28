/**
 * Comando .topativo — Exibe o mural de bravura e atividade do grupo: .topativo
 */
module.exports = {
    name: "topativo",
    aliases: ["topativo-cmd","cmd-topativo"],
    category: "general",
    subcategory: "Ranking",
    description: "Exibe o mural de bravura e atividade do grupo: .topativo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🏆 *MURAL DE CAVALEIROS MAIS ATIVOS*\n\n🥇 Capitão do Grupo (Rank Mítico)\n🥈 Grão-Mestre Paladino (Rank Diamante)\n🥉 Cavaleiro de Platina (Rank Ouro)\n\nContinue interagindo para subir no ranking do Reino!");
        }
};
