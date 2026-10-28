/**
 * Comando .antispamlink / .blockexternallinks
 * Liga/desliga o bloqueio de links de Telegram, convites de outros grupos,
 * canais do WhatsApp e links encurtados. A regra fica em
 * services/groupProtectionService.js (linkDeSpam / processarMensagem).
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");

module.exports = {
    name: "antispamlink",
    aliases: ["bloquearlinkexterno","antitelegram","blockexternallinks","antidivulgacao","cmd_antispamlink","alt_antispamlink","atalho_antispamlink","abrev_antispamlink","call_antispamlink","func_antispamlink"],
    category: "admin",
    description: "Apaga e remove do grupo quem mandar link de Telegram, convite de outro grupo, canal do WhatsApp ou link encurtado",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, prefix }) => {
        const p = prefix || ".";
        const configs = dataService.getConfigsData();
        const cfg = configs[from] || {};

        const opt = (args[0] || "").toLowerCase().trim();
        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (!isEnable && !isDisable) {
            return reply(
                `🛡️ O bloqueio de links de divulgação está *${cfg.antispamlink ? "ligado" : "desligado"}* neste grupo.\n\n` +
                "Com ele ligado, apago a mensagem e removo do grupo quem mandar link de Telegram, convite de outro grupo do WhatsApp, " +
                "canal do WhatsApp ou link encurtado (bit.ly e parecidos). Admins não são afetados, a não ser com a moderação estrita ligada.\n\n" +
                `• \`${p}antispamlink on\` para ligar\n` +
                `• \`${p}antispamlink off\` para desligar`
            );
        }

        cfg.antispamlink = isEnable;
        await dataService.saveConfigsData({ [from]: cfg });
        logger.info(`[ANTISPAMLINK] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        return reply(
            isEnable
                ? "🛡️ Pronto, liguei o bloqueio de links de divulgação. Quem mandar link de Telegram, convite de outro grupo, canal ou link encurtado vai ter a mensagem apagada e sair do grupo."
                : "🛡️ Pronto, desliguei o bloqueio de links de divulgação."
        );
    }
};
