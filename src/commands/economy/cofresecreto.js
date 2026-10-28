/**
 * Comando .cofresecreto — Acessa o cofre oculto no porão do Javali: .cofresecreto
 */
module.exports = {
    name: "cofresecreto",
    aliases: ["cofresecreto-cmd","cmd-cofresecreto","cmd_cofresecreto","alt_cofresecreto","atalho_cofresecreto","abrev_cofresecreto","call_cofresecreto","func_cofresecreto"],
    category: "economy",
    subcategory: "Banco",
    description: "Acessa o cofre oculto no porão do Javali: .cofresecreto",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🗝️ *COFRE OCULTO NO PORÃO*\n\nProtegido por um feitiço de ilusão de Mago.\nNenhum batedor de carteiras ou demônio consegue enxergar este compartimento!`);
        }
};
