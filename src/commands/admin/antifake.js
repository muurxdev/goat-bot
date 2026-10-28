/**
 * Comando .antifake
 * Liga/desliga a remoção automática de quem entra com número de fora do Brasil.
 * A regra fica em services/groupProtectionService.js (aplicarAntifake), chamada
 * pelo groupEventsHandler na entrada de cada participante.
 */

const dataService = require("../../services/dataService");
const groupProtectionService = require("../../services/groupProtectionService");
const logger = require("../../core/logger");

module.exports = {
    name: "antifake",
    aliases: ["bloquearfake","antivirtual","antiddd","fakeblock","cmd_antifake","alt_antifake","atalho_antifake","abrev_antifake","call_antifake","func_antifake"],
    category: "admin",
    description: "Remove na hora quem entrar no grupo com número de fora do Brasil (que não começa com +55)",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, prefix }) => {
        const p = prefix || ".";
        const configs = dataService.getConfigsData();
        const cfg = configs[from] || {};
        const opt = (args[0] || "").toLowerCase().trim();

        if (["preview", "teste", "test", "ver"].includes(opt)) {
            return reply(
                "🛡️ Quando alguém entrar com número de fora do Brasil, o grupo vai ver esta mensagem:\n\n" +
                groupProtectionService.textoAntifake(sender),
                [sender]
            );
        }

        const isEnable = ["on", "1", "ativar", "sim", "ligar"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao", "desligar"].includes(opt);

        if (!isEnable && !isDisable) {
            return reply(
                `🛡️ O bloqueio de números estrangeiros está *${cfg.antifake ? "ligado" : "desligado"}* neste grupo.\n\n` +
                "Com ele ligado, quem entrar com número que não começa com +55 é removido na hora. " +
                "Quem já está no grupo não é afetado, e se eu não conseguir ver o número de quem entrou, não removo.\n\n" +
                `• \`${p}antifake on\` para ligar\n` +
                `• \`${p}antifake off\` para desligar\n` +
                `• \`${p}antifake preview\` para ver o aviso`
            );
        }

        cfg.antifake = isEnable;
        await dataService.saveConfigsData({ [from]: cfg });
        logger.info(`[ANTIFAKE] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        return reply(
            isEnable
                ? "🛡️ Pronto, liguei o bloqueio de números estrangeiros. A partir de agora removo quem entrar com número que não começa com +55."
                : "🛡️ Pronto, desliguei o bloqueio de números estrangeiros. Números de outros países podem entrar normalmente."
        );
    }
};
