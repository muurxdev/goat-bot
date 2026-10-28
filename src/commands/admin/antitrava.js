/**
 * Comando .antitrava
 * Ativa ou desativa o bloqueio e expulsão automática por envio de travas de texto
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "antitrava",
    aliases: ["bloqueartrava","antitrava-zap","travazap","cmd_antitrava","alt_antitrava","atalho_antitrava","abrev_antitrava","call_antitrava","func_antitrava"],
    category: "admin",
    description: "Ativa ou desativa a proteção contra mensagens pesadas e travas no grupo",
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
            configs[from].antitrava = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTITRAVA] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Proteção Anti-TravaZap\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar este recurso:_ \`.antitrava off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "nao") {
            configs[from].antitrava = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTITRAVA] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Proteção Anti-TravaZap\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar este recurso:_ \`.antitrava on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        const isEnabled = Boolean(configs[from].antitrava);
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🛡️ *Recurso:* Proteção Anti-TravaZap\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Como alterar:*\n`;
        doc += `• \`.antitrava on\` — Ativar proteção\n`;
        doc += `• \`.antitrava off\` — Desativar proteção\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
