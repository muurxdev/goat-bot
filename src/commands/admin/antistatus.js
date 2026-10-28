/**
 * Comando .antistatus
 * Liga/desliga a proteção contra divulgação do grupo no status.
 * - Quem marca o grupo no próprio status leva advertência e, no limite, sai
 *   (messageHandler, trecho status@broadcast).
 * - O aviso "mencionou este grupo no status" que aparece dentro do grupo é
 *   apagado (services/groupProtectionService.js).
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");

module.exports = {
    name: "antistatus",
    aliases: ["bloquearstatus","proibirstatus","statusspam","cmd_antistatus","alt_antistatus","atalho_antistatus","abrev_antistatus","call_antistatus","func_antistatus"],
    category: "admin",
    description: "Pune quem marca o grupo no status: apaga o aviso no grupo e dá advertência",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, prefix, isBotAdmin }) => {
        const p = prefix || ".";
        const configs = dataService.getConfigsData();
        const cfg = configs[from] || {};
        const opt = (args[0] || "").toLowerCase().trim();
        const warnLimit = cfg.warnLimit || 3;

        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (!isEnable && !isDisable) {
            return reply(
                `📢 A proteção contra divulgação no status está *${cfg.antistatus ? "ligada" : "desligada"}* neste grupo.\n\n` +
                "Com ela ligada, quando alguém marca o grupo no próprio status eu apago o aviso que aparece aqui e dou uma advertência. " +
                `Com ${warnLimit} advertências, a pessoa é removida. Só consigo ver o status de quem tem meu número salvo, então nem toda marcação chega até mim.\n\n` +
                `• \`${p}antistatus on\` para ligar\n` +
                `• \`${p}antistatus off\` para desligar`
            );
        }

        cfg.antistatus = isEnable;
        await dataService.saveConfigsData({ [from]: cfg });
        logger.info(`[ANTISTATUS] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        if (!isEnable) return reply("📢 Pronto, desliguei a proteção contra divulgação no status.");

        let texto = "📢 Pronto, liguei a proteção contra divulgação no status.";
        if (!isBotAdmin) texto += " Para apagar o aviso e remover alguém, preciso ser administrador do grupo.";
        return reply(texto);
    }
};
