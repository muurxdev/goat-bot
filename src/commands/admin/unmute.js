/**
 * Comando .unmute / .desmutar / .dessilenciar
 * Remove o silenciamento de um membro ou de todos no grupo
 */

const muteService = require("../../services/muteService");
const groupAuthService = require("../../services/groupAuthService");
const groupRemovalService = require("../../services/groupRemovalService");
const logger = require("../../core/logger");

module.exports = {
    name: "unmute",
    aliases: ["dessilenciar","desmutar","tirarmute","resetmute","cmd_unmute","alt_unmute","atalho_unmute","abrev_unmute","call_unmute","func_unmute"],
    category: "admin",
    description: "Remove o silenciamento de um usuário ou de todos no grupo",
    usage: "<@pessoa | all>",
    examples: ["@fulano — devolve a voz da pessoa", "all — libera todo mundo"],
    groupOnly: true,
    adminOnly: true,
    execute: async ({ client, from, args = [], mentioned, quotedSender, info, reply, sender, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase().trim();

        if (['all', 'todos', 'tudo', 'reset'].includes(sub)) {
            const count = muteService.resetAllMutes(from);
            if (!count) return reply('🔊 Ninguém estava silenciado neste grupo.');
            return reply(`🔊 Liberei a voz de todo mundo no grupo (${count} ${count === 1 ? 'pessoa' : 'pessoas'}).`);
        }

        const alvo = groupRemovalService.extrairAlvo({ info, args, quotedSender, mentioned });
        if (!alvo) {
            return reply(`❓ Diga quem liberar: \`${prefix}unmute @pessoa\`, ou \`${prefix}unmute all\` para todo mundo.`);
        }

        let targetJid = alvo;
        try {
            targetJid = await groupAuthService.resolveMemberJid(client, alvo, from) || alvo;
        } catch (err) {
            logger.warn(`[UNMUTE] Não resolvi ${alvo} em ${from}: ${err.message}`);
        }
        const targetNum = targetJid.split("@")[0].split(":")[0];

        try {
            muteService.unmuteUser(from, targetJid);
            await client.sendMessage(from, {
                text: `🔊 Liberei a voz de @${targetNum}.`,
                mentions: [targetJid, sender]
            });
        } catch (err) {
            logger.error(`[UNMUTE] Falha ao liberar ${targetJid} em ${from}:`, err);
            return reply(`❌ Não consegui liberar @${targetNum} agora. Tente de novo em instantes.`, [targetJid]);
        }
    }
};
