/**
 * Comando .capslock
 * Liga/desliga o apagamento de mensagens em maiúsculas.
 * A regra fica em services/groupProtectionService.js (ehCapslock).
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");

module.exports = {
    name: "capslock",
    aliases: ["anticaps","anti-caps","maiusculas","cmd_capslock","alt_capslock","atalho_capslock","abrev_capslock","call_capslock","func_capslock"],
    category: "admin",
    subcategory: "Moderação",
    description: "Apaga mensagens escritas quase todas em maiúsculas",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender, prefix, isBotAdmin }) => {
        const p = prefix || ".";
        const configs = dataService.getConfigsData();
        const cfg = configs[from] || {};
        const opt = (args[0] || "").toLowerCase().trim();

        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (!isEnable && !isDisable) {
            return reply(
                `🔠 O filtro de maiúsculas está *${cfg.antiCapslock ? "ligado" : "desligado"}* neste grupo.\n\n` +
                "Com ele ligado, apago mensagens com pelo menos 10 letras e mais de 70% delas em maiúsculas (risada tipo kkkk não conta). " +
                "Admins não são afetados, a não ser com a moderação estrita ligada.\n\n" +
                `• \`${p}capslock on\` para ligar\n` +
                `• \`${p}capslock off\` para desligar`
            );
        }

        cfg.antiCapslock = isEnable;
        await dataService.saveConfigsData({ [from]: cfg });
        logger.info(`[CAPSLOCK] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        if (!isEnable) return reply("🔠 Pronto, desliguei o filtro de maiúsculas.");

        let texto = "🔠 Pronto, liguei o filtro de maiúsculas.";
        if (!isBotAdmin) texto += " Para apagar as mensagens, preciso ser administrador do grupo.";
        return reply(texto);
    }
};
