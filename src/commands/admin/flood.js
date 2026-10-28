/**
 * Comando .flood
 * Liga/desliga o limite de mensagens por minuto por pessoa.
 * A regra fica em services/groupProtectionService.js (registrarFlood).
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");

module.exports = {
    name: "flood",
    aliases: ["anti-flood","bloquearflood","cmd_flood","alt_flood","atalho_flood","abrev_flood","call_flood","func_flood"],
    category: "admin",
    subcategory: "Moderação",
    description: "Apaga as mensagens de quem passar do limite de mensagens por minuto",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender, prefix, isBotAdmin }) => {
        const p = prefix || ".";
        const configs = dataService.getConfigsData();
        const cfg = configs[from] || {};
        const opt = (args[0] || "").toLowerCase().trim();
        const avisoAdmin = isBotAdmin ? "" : " Para apagar as mensagens, preciso ser administrador do grupo.";

        if (["on", "1", "ativar", "sim"].includes(opt)) {
            cfg.antiFlood = true;
            cfg.floodLimit = cfg.floodLimit || 5;
            await dataService.saveConfigsData({ [from]: cfg });
            logger.info(`[FLOOD] Ativado em ${from} por ${sender}`);
            return reply(`🌊 Pronto, liguei o limite de ${cfg.floodLimit} mensagens por minuto por pessoa. O que passar disso eu apago.${avisoAdmin}`);
        }

        if (["off", "0", "desativar", "nao"].includes(opt)) {
            cfg.antiFlood = false;
            await dataService.saveConfigsData({ [from]: cfg });
            logger.info(`[FLOOD] Desativado em ${from} por ${sender}`);
            return reply("🌊 Pronto, desliguei o limite de mensagens por minuto.");
        }

        if (["limit", "limite", "max"].includes(opt)) {
            const newLimit = parseInt(args[1], 10);
            if (!newLimit || newLimit < 1 || newLimit > 50) {
                return reply(`❌ Informe um número entre 1 e 50. Exemplo: \`${p}flood limit 8\``);
            }
            cfg.floodLimit = newLimit;
            cfg.antiFlood = true;
            await dataService.saveConfigsData({ [from]: cfg });
            logger.info(`[FLOOD] Limite alterado para ${newLimit} em ${from} por ${sender}`);
            return reply(`🌊 Pronto, o limite agora é de ${newLimit} mensagens por minuto por pessoa, e está ligado.${avisoAdmin}`);
        }

        return reply(
            `🌊 O limite de mensagens está *${cfg.antiFlood ? "ligado" : "desligado"}* neste grupo, em ${cfg.floodLimit || 5} por minuto por pessoa.\n\n` +
            "Com ele ligado, apago as mensagens de quem passar do limite até a pessoa diminuir o ritmo. " +
            "Admins não são afetados, a não ser com a moderação estrita ligada.\n\n" +
            `• \`${p}flood on\` para ligar\n` +
            `• \`${p}flood off\` para desligar\n` +
            `• \`${p}flood limit <n>\` para mudar o limite (1 a 50)`
        );
    }
};
