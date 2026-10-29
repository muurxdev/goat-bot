const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando Unificado .adm
 * Promove ou rebaixa administradores do grupo em um único comando inteligente
 */

const logger = require('../../core/logger')
const F = require('../../utils/formato')
const groupAuthService = require('../../services/groupAuthService')

module.exports = {
    name: 'adm',
    aliases: ["admin","promote","demote","daradm","tiraradm","setadm","admtoggle","promover","rebaixar","liberaradm","bloquearadm","cmd_adm","alt_adm","atalho_adm","abrev_adm","call_adm","func_adm"],
    category: 'admin',
    description: 'Promove ou rebaixa um participante a administrador do grupo',
    usage: '[dar|tirar] <@pessoa>',
    examples: ['@fulano — promove se for membro, rebaixa se for administrador', 'dar @fulano — promove a administrador', 'tirar @fulano — volta a membro comum'],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ info, from, sender, args, client, reply, quotedSender, commandName, prefix = '.' }) => {
        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        let subAction = null

        // Detecta se o comando chamado foi diretamente .promote ou .demote
        if (commandName === 'promote' || commandName === 'promover' || commandName === 'daradm') {
            subAction = 'promote'
        } else if (commandName === 'demote' || commandName === 'rebaixar' || commandName === 'tiraradm') {
            subAction = 'demote'
        }

        // Detecta se o primeiro argumento é "dar", "liberar", "promover" ou "tirar", "bloquear", "rebaixar"
        if (args[0] === 'dar' || args[0] === 'add' || args[0] === 'promover' || args[0] === 'liberar' || args[0] === 'on') {
            subAction = 'promote'
            args.shift()
        } else if (args[0] === 'tirar' || args[0] === 'remover' || args[0] === 'del' || args[0] === 'rebaixar' || args[0] === 'bloquear' || args[0] === 'off') {
            subAction = 'demote'
            args.shift()
        }

        const target = mentioned
            || quotedSender
            || (args[0] ? args[0].replace(/[@+\s-]/g, '') + '@s.whatsapp.net' : null)

        if (!target) {
            return reply(F.tela({
                emoji: '👑', titulo: 'Promover ou rebaixar', prefix,
                intro: 'Marque a pessoa (ou responda a uma mensagem dela). Se ela for membro comum, vira administrador; se já for, volta a membro.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'adm', '@pessoa')] }],
                dica: 'Para não depender de quem a pessoa é hoje, diga o que quer: dar ou tirar.',
                proximos: [
                    { nome: 'adm', args: 'dar @pessoa', oque: 'promove a administrador' },
                    { nome: 'adm', args: 'tirar @pessoa', oque: 'volta a membro comum' },
                    { nome: 'admins', oque: 'lista quem administra o grupo' }
                ]
            }))
        }

        if (target === sender) {
            return reply('❌ Não mexo no seu próprio cargo. Peça para outro administrador fazer isso por você.')
        }

        // Tirar o cargo de mim mesmo deixaria o grupo sem as proteções que dependem
        // de eu ser administrador (antes só o próprio autor era barrado).
        if (groupAuthService.isBotJid(target)) {
            return reply('🤖 Esse sou eu. Não mexo no meu próprio cargo: sem ser administrador eu perco as proteções do grupo.')
        }

        let apiJid = null
        let targetIsAdmin = false

        try {
            const groupData = await groupAuthService.getGroupData(from, { refresh: true })

            const isGroupAdmin = Array.from(groupData.admins).some(a => groupAuthService.sameUser(a, sender))
            if (!isGroupAdmin) {
                return reply('🛡️ Só administradores deste grupo podem promover ou rebaixar alguém.')
            }

            if (!groupData.isBotAdmin) {
                return reply('🛡️ Preciso ser administrador deste grupo para mudar cargos. Me promova nas informações do grupo e tente de novo.')
            }

            apiJid = await groupAuthService.resolveMemberJid(client, target, groupData) || target

            const isParticipant = groupData.participants.some(p =>
                groupAuthService.sameUser(p.id, apiJid))
            if (!isParticipant) {
                return reply('❌ O usuário marcado não é participante deste grupo.')
            }

            targetIsAdmin = Array.from(groupData.admins).some(a => groupAuthService.sameUser(a, apiJid))
        } catch (err) {
            logger.error('[ADM AUTH ERROR]', err)
            return reply('❌ *Falha na validação do grupo!* Tente novamente em alguns instantes.')
        }

        // Decide a ação: Se subAction estiver definido, usa ele; caso contrário, inverte o estado atual
        const action = subAction || (targetIsAdmin ? 'demote' : 'promote')

        try {
            await client.groupParticipantsUpdate(from, [apiJid], action)
            groupAuthService.invalidate(from)

            const { getBotName } = require('../../config/botConfig');
            const botName = getBotName();
            const targetNum = target.split('@')[0].split(':')[0];
            const senderNum = sender.split('@')[0].split(':')[0];

            if (action === 'promote') {
                logger.info(`[ADM PROMOTE] ${sender} promoveu ${target} em ${from}`);
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║       ⭐ *ADMIN PROMOVIDO* ⭐      ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ HIERARQUIA DO GRUPO 〕━⬣\n`;
                doc += `┃ 👤 *Participante:* @${targetNum}\n`;
                doc += `┃ 🎖️ *Novo Cargo:* ⭐ *ADMINISTRADOR DO GRUPO*\n`;
                doc += `┃ 🛡️ *Promovido por:* ${nomeDoMembro(sender)}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Para rebaixar este participante:_ \`.adm demote @${targetNum}\`\n`;
                doc += `👑 *${botName}*`;

                return reply(doc.trim(), [target, sender]);
            } else {
                logger.info(`[ADM DEMOTE] ${sender} rebaixou ${target} em ${from}`);
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║       🔻 *ADMIN REBAIXADO* 🔻      ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 ⚙️ HIERARQUIA DO GRUPO 〕━⬣\n`;
                doc += `┃ 👤 *Participante:* @${targetNum}\n`;
                doc += `┃ 🔻 *Novo Cargo:* 👤 *MEMBRO COMUM*\n`;
                doc += `┃ 🛡️ *Rebaixado por:* ${nomeDoMembro(sender)}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `💡 _Para promover este participante:_ \`.adm promote @${targetNum}\`\n`;
                doc += `👑 *${botName}*`;

                return reply(doc.trim(), [target, sender]);
            }
        } catch (err) {
            logger.error('[ADM UPDATE ERROR]', err)
            return reply('❌ *Não consegui mudar o cargo.* O WhatsApp recusou o pedido. Confira se eu ainda sou administrador e tente de novo em instantes.')
        }
    }
}

