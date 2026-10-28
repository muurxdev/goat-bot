const { getBotName } = require("../../config/botConfig");

/**
 * Comando .boasvindascustom — Modelo de boas-vindas solenes para novos recrutas: .boasvindascustom
 */
module.exports = {
    name: "boasvindascustom",
    aliases: ["boasvindascustom-cmd","cmd-boasvindascustom","cmd_boasvindascustom","alt_boasvindascustom","atalho_boasvindascustom","abrev_boasvindascustom","call_boasvindascustom","func_boasvindascustom"],
    category: "admin",
    subcategory: "Boas-vindas",
    description: "Mostra um modelo de boas-vindas para receber quem chega ao grupo",
    cooldownMs: 2000,
    execute: async ({ reply, prefix = "." }) => {
            return reply(`👋 *Boas-vindas ao grupo!*\n\nQue bom ter você aqui. Puxe um banco na taverna e fique à vontade.\n\n📜 Leia as regras: \`${prefix}listaregras\`\n📖 Veja tudo o que eu faço: \`${prefix}menu\`\n\n🍺 _${getBotName()}_`);
        }
};
