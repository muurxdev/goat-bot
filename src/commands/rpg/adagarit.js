/**
 * Comando .adagarit — Lança a Adaga Rápida de Ferreiro: .adagarit
 */
module.exports = {
    name: "adagarit",
    aliases: ["adagarit-cmd","cmd-adagarit"],
    category: "rpg",
    subcategory: "Armas",
    description: "Lança a Adaga Rápida de Ferreiro: .adagarit",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🗡️ *LÂMINAS DA NEVE NEGRA (Dark Snow)*\n\n▫️ Técnica demoníaca proibida que canaliza cinzas letais na forma de adagas de gelo escuro.\n▫️ Ao menor contato, congela a circulação sanguínea do alvo.`);
        }
};
