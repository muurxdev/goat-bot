/**
 * Comando .dossiegrupo / .perfilgrupo / .grupodossie
 * Dossiê analítico e estatístico completo sobre o grupo
 */

const { renderCard, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "dossiegrupo",
    aliases: ["perfilgrupo", "grupodossie", "infodetalhadagrupo"],
    category: "general",
    description: "Gera um dossiê analítico completo sobre o grupo",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply, client }) => {
        const metadata = await client.groupMetadata(from).catch(() => ({}));
        const participantes = metadata.participants || [];
        const admins = participantes.filter(p => p.admin).length;
        const membrosComuns = participantes.length - admins;

        const card = renderCard({
            title: "DOSSIÊ DE INTELIGÊNCIA DO GRUPO",
            icon: "📁",
            subtitle: `🏰 *Nome:* ${metadata.subject || "Grupo WhatsApp"}`,
            sections: [
                {
                    title: "DADOS GERAIS & HIERARQUIA",
                    icon: "📊",
                    fields: [
                        { label: "ID do Grupo (JID)", value: from, icon: "🆔" },
                        { label: "Total de Membros", value: `${participantes.length} Membros`, icon: "👥" },
                        { label: "Corpo de Administradores", value: `${admins} Administradores`, icon: "🛡️" },
                        { label: "Membros Comuns", value: `${membrosComuns} Membros`, icon: "👤" }
                    ]
                },
                {
                    title: "MODERAÇÃO & SEGURANÇA",
                    icon: "🔒",
                    fields: [
                        { label: "Restrito para Envio", value: metadata.announce ? "🔴 *Apenas Admins*" : "🟢 *Todos os Membros*", icon: "📢" },
                        { label: "Edição de Dados", value: metadata.restrict ? "🔴 *Apenas Admins*" : "🟢 *Livre*", icon: "⚙️" }
                    ]
                }
            ],
            tip: "Use .gruposettings para ajustar as preferências de segurança!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

