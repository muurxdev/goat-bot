/**
 * Comando .slowmode / .modolento
 * Liga/desliga o intervalo mínimo entre mensagens de cada pessoa.
 * A regra fica em services/groupProtectionService.js (registrarSlowmode).
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");

module.exports = {
    name: "slowmode",
    aliases: ["modolento","limitermensagens","slow","cmd_slowmode","alt_slowmode","atalho_slowmode","abrev_slowmode","call_slowmode","func_slowmode"],
    category: "admin",
    description: "Liga o modo lento: cada pessoa só pode mandar uma mensagem a cada X segundos",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply, args, prefix, isBotAdmin }) => {
        const p = prefix || ".";
        const configs = dataService.getConfigsData();
        const cfg = configs[from] || {};
        const sub = (args[0] || "").toLowerCase().trim();

        if (sub === "off" || sub === "desativar" || sub === "0") {
            cfg.slowmode = false;
            cfg.slowmodeSeconds = 0;
            await dataService.saveConfigsData({ [from]: cfg });
            logger.info(`[SLOWMODE] Desativado em ${from} por ${sender}`);
            return reply("⏳ Pronto, desliguei o modo lento. O chat está liberado.");
        }

        if (sub === "status" || sub === "ver") {
            return reply(
                cfg.slowmode
                    ? `⏳ O modo lento está ligado: uma mensagem a cada ${cfg.slowmodeSeconds || 5} segundos por pessoa.`
                    : `⏳ O modo lento está desligado. Use \`${p}slowmode <segundos>\` para ligar.`
            );
        }

        const segundos = Math.min(3600, Math.max(1, parseInt(sub, 10) || 5));
        cfg.slowmode = true;
        cfg.slowmodeSeconds = segundos;
        await dataService.saveConfigsData({ [from]: cfg });
        logger.info(`[SLOWMODE] ${segundos}s em ${from} por ${sender}`);

        let texto = `⏳ Pronto, liguei o modo lento: cada pessoa pode mandar uma mensagem a cada ${segundos} segundos, e apago as que vierem antes. ` +
            `Admins não são afetados, a não ser com a moderação estrita ligada. Para desligar, use \`${p}slowmode off\`.`;
        if (!isBotAdmin) texto += "\n\nPara apagar as mensagens, preciso ser administrador do grupo.";
        return reply(texto);
    }
};
