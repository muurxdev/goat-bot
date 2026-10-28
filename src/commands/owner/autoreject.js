/**
 * Comando .autoreject
 * Ativa ou desativa a recusa automática de convites de grupos no privado
 */

const dataService = require('../../services/dataService');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'autoreject',
    aliases: ['recusarconvites', 'autorecusa', 'bloquearconvites'],
    category: 'owner',
    description: 'Ativa/desativa recusa automática de convites para entrar em grupos no privado',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ text, reply, sender }) => {
        const botName = getBotName();
        const param = (text || '').trim().toLowerCase();
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Dono";

        const configs = dataService.getConfigsData();
        if (!configs['global']) configs['global'] = {};
        const currentlyActive = !!configs['global'].autoRejectInvites;

        if (!param) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *RECUSA DE CONVITES* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DE CONVITES 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Auto-Rejeição de Convites de Grupo\n`;
            doc += `┃ ${currentlyActive ? "🟢" : "🔴"} *Estado Atual:* ${currentlyActive ? "*ATIVADO (Convites Recusados)*" : "*DESATIVADO (Convites Aceitos)*"}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Como alterar:*\n`;
            doc += `• \`.autoreject on\` — Ativar recusa automática\n`;
            doc += `• \`.autoreject off\` — Desativar recusa automática\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        if (param === 'on' || param === 'ativar' || param === '1') {
            configs['global'].autoRejectInvites = true;
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *RECUSA DE CONVITES* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DE CONVITES 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Auto-Rejeição de Convites de Grupo\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar este recurso:_ \`.autoreject off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        }

        if (param === 'off' || param === 'desativar' || param === '0') {
            configs['global'].autoRejectInvites = false;
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *RECUSA DE CONVITES* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE DE CONVITES 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Auto-Rejeição de Convites de Grupo\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar este recurso:_ \`.autoreject on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        }

        return reply('❌ Opção inválida. Use `.autoreject on` ou `.autoreject off`.');
    }
};
