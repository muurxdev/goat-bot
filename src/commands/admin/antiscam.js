const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .antiscam / .antigolpe
 * Liga ou desliga a proteção zero-day contra tentativas de golpes, fraudes financeiras e esquemas suspeitos.
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "antiscam",
    aliases: [
        "antigolpe", "antifraude", "scamblock", "blockgolpe",
        "cmd_antiscam", "alt_antiscam", "atalho_antiscam", "abrev_antiscam", "call_antiscam", "func_antiscam"
    ],
    category: "admin",
    subcategory: "Moderação",
    description: "Remove instantaneamente quem tentar aplicar golpes de renda extra, tarefas falsas ou fraudes financeiras",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, prefix }) => {
        const p = prefix || ".";
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        const isEnable = ["on", "1", "ativar", "sim", "ligar"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao", "desligar"].includes(opt);

        if (!isEnable && !isDisable) {
            const isAtivo = Boolean(configs[from].antiscam);
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *PROTEÇÃO ANTI-GOLPE* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🚷 *Recurso:* Anti-Scam / Anti-Fraude\n`;
            doc += `┃ ${isAtivo ? "🟢" : "🔴"} *Estado Atual:* ${isAtivo ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Como alterar:*\n`;
            doc += `• \`${p}antiscam on\` — Ativar detecção de golpes e pirâmides\n`;
            doc += `• \`${p}antiscam off\` — Desativar proteção\n\n`;
            doc += `💡 *O que ele bloqueia?*\n`;
            doc += `Mensagens de renda extra, tarefas falsas (Shopee/TikTok/Likes), ofertas suspeitas de Pix e esquemas fraudulentos.\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        configs[from].antiscam = isEnable;
        await dataService.saveConfigsData(configs);
        logger.info(`[ANTISCAM] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🚷 *Recurso:* Anti-Scam / Anti-Fraude\n`;
        doc += `┃ ${isEnable ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"}\n`;
        doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Para ${isEnable ? "desativar" : "reativar"}:_ \`${p}antiscam ${isEnable ? "off" : "on"}\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
