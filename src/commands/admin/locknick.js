/**
 * Comando .locknick
 * Trava o nome do grupo. O WhatsApp não avisa quando alguém muda o próprio
 * apelido, então travar apelido de membro não é possível; o que o bot consegue
 * é desfazer a troca do NOME DO GRUPO feita por quem não é admin.
 * A regra fica em services/groupProtectionService.js (tratarAtualizacaoGrupo),
 * chamada pelo evento groups.update em core/connection.js.
 */

const dataService = require("../../services/dataService");
const groupProtectionService = require("../../services/groupProtectionService");
const logger = require("../../core/logger");

module.exports = {
    name: "locknick",
    aliases: ["antifakenick","travarapelido","bloquearnick","cmd_locknick","alt_locknick","atalho_locknick","abrev_locknick","call_locknick","func_locknick"],
    category: "admin",
    description: "Trava o nome do grupo: se um membro comum trocar, eu volto ao nome travado",
    usage: "[on|off]",
    examples: [" — mostra se a trava está ligada", "on — liga a trava do nome", "off — desliga a trava"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, prefix, isBotAdmin }) => {
        const p = prefix || ".";
        const opt = (args[0] || "").toLowerCase().trim();
        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (!isEnable && !isDisable) {
            const cfg = dataService.getConfigsData()[from] || {};
            return reply(
                `🔒 A trava do nome do grupo está *${cfg.locknick ? "ligada" : "desligada"}*` +
                (cfg.locknick && cfg.locknickNome ? `, no nome *${cfg.locknickNome}*.` : ".") +
                "\n\nCom ela ligada, se alguém que não é admin trocar o nome do grupo, eu volto para o nome travado. " +
                "Quando um admin troca o nome, o novo passa a ser o travado. O apelido de cada pessoa não dá para travar, porque o WhatsApp não me avisa quando alguém muda.\n\n" +
                `• \`${p}locknick on\` para ligar\n` +
                `• \`${p}locknick off\` para desligar`
            );
        }

        const nome = await groupProtectionService.definirTravaNome(from, isEnable);
        logger.info(`[LOCKNICK] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        if (!isEnable) return reply("🔒 Pronto, destravei o nome do grupo.");

        let texto = nome
            ? `🔒 Pronto, travei o nome do grupo em *${nome}*.`
            : "🔒 Pronto, liguei a trava. Não consegui ler o nome atual agora, então vou travar no próximo nome que o grupo receber.";
        if (!isBotAdmin) texto += " Para voltar o nome quando alguém trocar, preciso ser administrador do grupo.";
        return reply(texto);
    }
};
