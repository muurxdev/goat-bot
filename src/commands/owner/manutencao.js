/**
 * Comando .manutencao
 * Ativa ou desativa o Modo Manutenção global
 */

const securityService = require('../../services/securityService');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'manutencao',
    aliases: ['maintenance'],
    category: 'owner',
    description: 'Ativa ou desativa o Modo Manutenção global (.manutencao on/off)',
    ownerOnly: true,
    execute: async ({ text, reply, sender }) => {
        const botName = getBotName();
        const opt = text?.toLowerCase().trim();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Dono";

        if (opt === 'on') {
            securityService.setMaintenance(true);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔧 *INFRAESTRUTURA & VPS* 🔧   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DO SERVIDOR 〕━⬣\n`;
            doc += `┃ 🔧 *Recurso:* Modo Manutenção Global\n`;
            doc += `┃ 🔴 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar a manutenção:_ \`.manutencao off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        } else if (opt === 'off') {
            securityService.setMaintenance(false);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔧 *INFRAESTRUTURA & VPS* 🔧   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DO SERVIDOR 〕━⬣\n`;
            doc += `┃ 🔧 *Recurso:* Modo Manutenção Global\n`;
            doc += `┃ 🟢 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar a manutenção:_ \`.manutencao on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        }

        const isEnabled = Boolean(securityService.isMaintenanceActive());
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔧 *INFRAESTRUTURA & VPS* 🔧   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONTROLE DO SERVIDOR 〕━⬣\n`;
        doc += `┃ 🔧 *Recurso:* Modo Manutenção Global\n`;
        doc += `┃ ${isEnabled ? "🔴" : "🟢"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Como alterar:*\n`;
        doc += `• \`.manutencao on\` — Ativar manutenção\n`;
        doc += `• \`.manutencao off\` — Desativar manutenção\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
