/**
 * Comando .infogrupo
 * Exibe o dossiê completo e métricas do grupo atual
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");

module.exports = {
    name: "infogrupo",
    aliases: ["groupinfo","dadosgrupo","infogp","gpinfo","cmd_infogrupo","alt_infogrupo","atalho_infogrupo","abrev_infogrupo","call_infogrupo","func_infogrupo"],
    category: "admin",
    description: "Mostra os dados do grupo: nome, criador, membros, convite e proteções",
    examples: [" — mostra os dados deste grupo"],
    groupOnly: true,
    execute: async ({ client, from, reply, isBotAdmin }) => {
        try {
            const meta = await client.groupMetadata(from);
            const participants = meta.participants || [];
            const admins = participants.filter(p => p.admin);
            const ownerJid = meta.owner || (meta.id ? meta.id.split("-")[0] + "@s.whatsapp.net" : "Desconhecido");
            const ownerNum = ownerJid.split("@")[0].split(":")[0];

            // O WhatsApp só entrega o código de convite a admin. Sem admin a falha
            // era engolida e o dossiê dizia só "Não disponível", sem dizer por quê.
            let inviteLink = "🔒 Só aparece se eu for administrador do grupo";
            if (isBotAdmin) {
                try {
                    const code = await client.groupInviteCode(from);
                    inviteLink = typeof code === "string" && code ? "https://chat.whatsapp.com/" + code : "Não disponível";
                } catch (errLink) {
                    logger.warn(`[INFOGRUPO] Falha ao obter link de ${from}: ${errLink.message}`);
                    inviteLink = "Não disponível agora";
                }
            }

            const allConfigs = dataService.getConfigsData();
            const cfg = allConfigs[from] || {};
            const createdAt = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Desconhecida";

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║     📁 *DOSSIÊ DO GRUPO* 📁     ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;

            doc += `╭━〔 🏷️ IDENTIFICAÇÃO DO GRUPO 〕━⬣\n`;
            doc += `┃ 📛 *Nome:* ${meta.subject || "Grupo"}\n`;
            doc += `┃ 👑 *Criador:* @${ownerNum}\n`;
            doc += `┃ 📅 *Criado em:* ${createdAt}\n`;
            doc += `┃ 👥 *Membros:* ${participants.length} (${admins.length} admins)\n`;
            doc += `┃ 🔗 *Convite:* ${inviteLink}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

            doc += `╭━〔 🛡️ SEGURANÇA & MÓDULOS 〕━⬣\n`;
            doc += `┃ 🚫 *Anti-Link:* ${cfg.antiLink ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ 🛡️ *Anti-Spam:* ${cfg.antiSpam ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ ⚠️ *Anti-Trava:* ${cfg.antiTrava ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ 🎉 *Boas-Vindas:* ${cfg.welcome ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ 🔓 *Abertura:* ${cfg.abertura !== false && cfg.aberturaEnabled !== false ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `┃ 🔒 *Fechamento:* ${cfg.fechamento !== false && cfg.fechamentoEnabled !== false ? "🟢 Ativo" : "🔴 Inativo"}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

            if (meta.desc) {
                doc += `╭━〔 📜 DESCRIÇÃO 〕━⬣\n`;
                doc += `${String(meta.desc.slice(0, 300) + (meta.desc.length > 300 ? "..." : "")).split('\n').map(l => '┃ ' + l).join('\n')}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            }

            doc += `💡 _Digite \`.admins\` para listar os administradores._`;

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [ownerJid]
            });
        } catch (err) {
            logger.warn(`[INFOGRUPO] Falha em ${from}: ${err.message}`);
            return reply("❌ Não consegui ler os dados do grupo agora. Tente de novo em instantes.");
        }
    }
};
