/**
 * Comando .mandamentopaciencia — Testa a maldição do Mandamento da Paciência (Drole): .mandamentopaciencia
 */
module.exports = {
    name: "mandamentopaciencia",
    aliases: ["mandamentopaciencia-cmd","cmd-mandamentopaciencia"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa a maldição do Mandamento da Paciência (Drole): .mandamentopaciencia",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`⏳ *MANDAMENTO DA PACIÊNCIA (Drole)*\n\n▫️ Aqueles que forem impacientes ou não tolerarem a dor em batalha recebem dor e sofrimento ampliados exponencialmente.`);
        }
};
