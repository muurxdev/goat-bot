/**
 * Comando .climanoturno — Envia mensagem temática de boa noite para a guilda: .climanoturno
 */
module.exports = {
    name: "climanoturno",
    aliases: ["climanoturno-cmd","cmd-climanoturno"],
    category: "general",
    subcategory: "Mensagens",
    description: "Envia mensagem temática de boa noite para a guilda: .climanoturno",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🌙✨ *O CELESTE NOTURNO CENTRAL*\n\nAs estrelas brilham sobre as colinas do Reino...\nA Taverna do Javali fecha suas janelas.\nTenham todos uma noite revigorante de descanso!");
        }
};
