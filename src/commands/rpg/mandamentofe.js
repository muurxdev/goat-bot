/**
 * Comando .mandamentofe — Testa o Mandamento da Fé (Rainha): .mandamentofe
 */
module.exports = {
    name: "mandamentofe",
    aliases: ["mandamentofe-cmd","cmd-mandamentofe"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento da Fé (Rainha): .mandamentofe",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🐍 *MANDAMENTO DA FÉ (Rainha)*\n\n"Qualquer um que perder a fé diante dos seus olhos terá a visão queimada pelas chamas negras do abismo!"\n⚠️ Os olhos dos infiéis ardem em combustão instantânea.`);
        }
};
