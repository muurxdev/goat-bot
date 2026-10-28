/**
 * Comando .statusclube — Exibe o status do clube de fãs dos Sete Traços: .statusclube
 */
module.exports = {
    name: "statusclube",
    aliases: ["statusclube-cmd","cmd-statusclube"],
    category: "general",
    subcategory: "Grupo",
    description: "Exibe o status do clube de fãs dos Sete Traços: .statusclube",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🛡️🍻 *CLUBE OFICIAL DOS CAVALEIROS DO BOAR HAT*\n\n▫️ Membros Ativos: 7 Pecados + Princesa + Guardião\n▫️ Local: Qualquer colina do Reino onde a taverna parar\n▫️ Status: Em missão de proteção ao reino!");
        }
};
