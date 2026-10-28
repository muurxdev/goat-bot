/**
 * Comando .antispam
 * Ativa ou desativa o monitoramento de flood e spam de mensagens no grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "antispam",
    aliases: [
        "antiflood", "bloquearspam", "limitemsg", "limitemensagem", "removerlimite", "semspam",
        "cmd_antispam", "alt_antispam", "atalho_antispam", "abrev_antispam", "call_antispam", "func_antispam"
    ],
    category: "admin",
    description: "Ativa ou desativa a proteção contra excesso de mensagens e flood/limite de mensagens no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim") {
            configs[from].antispam = true;
            configs[from].antiFlood = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTISPAM] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Proteção Anti-Spam & Flood\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar este recurso e remover limites:_ \`.antispam off\` ou \`.limitemsg off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "nao" || opt === "remover") {
            configs[from].antispam = false;
            configs[from].antiFlood = false;
            configs[from].slowmode = false;
            configs[from].floodLimit = 999999;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTISPAM] Desativado em ${from} por ${sender} (limites de mensagens removidos)`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Limite de Mensagens & Anti-Spam\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO (LIVRE)*\n`;
            doc += `┃ 💬 *Chat:* Nenhum limite de velocidade ou exclusão de mensagens ativo\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar a proteção:_ \`.antispam on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        const isEnabled = Boolean(configs[from].antispam || configs[from].antiFlood);
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🛡️ *Recurso:* Proteção Anti-Spam & Limite de Mensagens\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO (LIVRE)*"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Rápidos:*\n`;
        doc += `• \`.antispam off\` ou \`.limitemsg off\` — Desativar limite e não apagar mensagens de chat\n`;
        doc += `• \`.antispam on\` — Ativar proteção contra flood robotizado\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
