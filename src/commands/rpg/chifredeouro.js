/**
 * Comando .chifredeouro — Toca o Chifre de Cernunnos no templo das deusas: .chifredeouro
 */
module.exports = {
    name: "chifredeouro",
    aliases: ["chifredeouro-cmd","cmd-chifredeouro"],
    category: "rpg",
    subcategory: "Relíquia",
    description: "Toca o Chifre de Cernunnos no templo das deusas: .chifredeouro",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`📯 *CHIFRE DE CERNUNNOS*\n\nO som reverbera pelos planos celestiais...\nAs deusas presas no orbe ouvem o chamado dos mortais, concedendo uma revelação oracular sobre a próxima grande guerra.`);
        }
};
