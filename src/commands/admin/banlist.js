const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .banlist / .listabanidos / .banidos
 * Consulta a lista negra e histórico de membros banidos/punidos no grupo
 */

const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "banlist",
    aliases: ["listabanidos","banidos","listanegra","cmd_banlist","alt_banlist","atalho_banlist","abrev_banlist","call_banlist","func_banlist"],
    category: "admin",
    description: "Exibe o relatório de usuários banidos e registros de punições do grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const warnsData = dataService.getWarnsData();
        const groupWarns = warnsData[from] || {};

        const banidos = Object.entries(groupWarns)
            .filter(([_, data]) => (data.count || 0) >= 3 || data.banned)
            .map(([userJid, data]) => `🚫 ${nomeDoMembro(userJid)} — ${data.count || 3} Advertências`);

        const fields = banidos.length > 0
            ? banidos
            : ["_Nenhum membro banido ou na lista negra deste grupo._"];

        const card = renderCard({
            title: "LISTA NEGRA & AUDITORIA DE BANIMENTOS",
            icon: "🚫",
            subtitle: `🛡️ *Grupo:* ${from.split("@")[0]}`,
            sections: [
                {
                    title: "MEMBROS REGISTRADOS",
                    icon: "⚖️",
                    fields: fields
                }
            ],
            tip: "Use .warn reset @user para perdoar e zerar as punições de um membro!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

