const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .kick / .remover / .expulsar
 * Remove um membro do grupo. Admin também pode ser removido; só o criador do
 * grupo é protegido. A confirmação vem do WhatsApp, não de suposição.
 */

const groupRemovalService = require('../../services/groupRemovalService');
const figurinhaEventoService = require('../../services/figurinhaEventoService');
const audioEventoService = require('../../services/audioEventoService');

module.exports = {
    name: 'kick',
    aliases: ["remover","expulsar","cmd_kick","alt_kick","atalho_kick","abrev_kick","call_kick","func_kick"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Remove um membro do grupo (inclusive admins, exceto o criador)',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ info, from, sender, client, reply, mentioned, quotedSender, args = [], prefix = '.' }) => {
        const userKick = groupRemovalService.extrairAlvo({ info, args, quotedSender, mentioned });

        if (!userKick) {
            return reply(`❓ Marque, responda ou digite o número de quem devo remover.\n\nExemplo: \`${prefix}kick @pessoa\``);
        }

        const resultado = await groupRemovalService.removerMembro(client, from, userKick, { autor: sender, origem: 'kick' });
        if (!resultado.ok) {
            const alvo = resultado.apiJid || userKick;
            return reply(groupRemovalService.mensagemFalha(resultado.motivo, alvo), [alvo]);
        }

        const targetJid = resultado.apiJid;
        const targetNum = targetJid.split('@')[0].split(':')[0];
        const senderNum = sender.split('@')[0].split(':')[0];

        await client.sendMessage(from, {
            text: `✅ @${targetNum} foi removido do grupo por ${nomeDoMembro(sender)}.`,
            mentions: [targetJid, sender]
        });
        await figurinhaEventoService.enviar(client, from, 'banimento');
        await audioEventoService.enviar(client, from, 'banimento');
    }
};
