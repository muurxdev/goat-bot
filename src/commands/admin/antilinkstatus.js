/**
 * Comando .antilinkstatus / .statusantilink / .linksbarrados
 * Relatório de links e canais interceptados pela moderação no grupo
 */

const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "antilinkstatus",
    aliases: ["statusantilink","linksbarrados","relatoriolinks","cmd_antilinkstatus","alt_antilinkstatus","atalho_antilinkstatus","abrev_antilinkstatus","call_antilinkstatus","func_antilinkstatus"],
    category: "admin",
    description: "Exibe o relatório de moderação de links e configurações ativas do Anti-Link",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const configs = dataService.getConfigsData();
        const groupConfig = configs[from] || {};
        const isAntilink = Boolean(groupConfig.antilink);
        const acao = groupConfig.antilinkAction || "Remoção e Apagar Mensagem";

        const card = renderCard({
            title: "RELATÓRIO ANTI-LINK & SEGURANÇA",
            icon: "🔗",
            subtitle: `🛡️ *Grupo:* ${from.split("@")[0]}`,
            sections: [
                {
                    title: "STATUS DA MODERAÇÃO DE LINKS",
                    icon: "🔒",
                    fields: [
                        { label: "Módulo Anti-Link", value: isAntilink ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "🛡️" },
                        { label: "Ação Configurada", value: acao, icon: "⚡" },
                        { label: "Links Bloqueados", value: "Convites de Grupos, Canais, Encurtadores Suspeitos", icon: "🚫" }
                    ]
                },
                {
                    title: "COMANDOS DE GESTÃO",
                    icon: "⚙️",
                    fields: [
                        "• `.antilink on` ➔ Ativar proteção anti-link",
                        "• `.antilink off` ➔ Desativar proteção anti-link"
                    ]
                }
            ],
            tip: "Mantenha o Anti-Link ativado para evitar divulgação não autorizada!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

