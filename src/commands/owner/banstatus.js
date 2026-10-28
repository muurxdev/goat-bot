/**
 * Comando .banstatus
 * Bloqueia ou autoriza a marcação/interação de um usuário com o status do grupo/bot
 */

const { permissionRepo } = require('../../services/permissionService')
const logger = require('../../core/logger')

module.exports = {
    name: 'banstatus',
    aliases: ['blockstatus', 'unbanstatus'],
    category: 'owner',
    description: 'Controla e bloqueia a permissão de marcação do grupo nos status para um usuário específico',
    ownerOnly: true,
    execute: async ({ sender, args, reply, info }) => {
        const sub = args[0]?.toLowerCase()

        if (sub === 'list' || sub === 'lista') {
            const list = permissionRepo.getAllStatusBlocked()
            if (list.length === 0) {
                return reply('✅ Nenhum usuário possui restrições de status ativas.')
            }

            let msg = `🔕 *USUÁRIOS COM RESTRIÇÃO DE STATUS (${list.length}):*\n\n`
            list.forEach((item, i) => {
                msg += `${i + 1}. @${item.jid.split('@')[0]}\n`
                msg += `   📝 *Motivo:* ${item.reason || 'Sem motivo'}\n`
                msg += `   🛡️ *Autor:* @${item.blocked_by.split('@')[0]}\n\n`
            })
            const mentions = list.map(item => item.jid)
            return reply(msg.trim(), mentions)
        }

        const isUnblock = sub === 'off' || sub === 'remover' || info.body?.startsWith('.unbanstatus')
        const targetIndex = isUnblock ? 1 : 0

        let targetJid = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!targetJid && args[targetIndex]) {
            const cleanNum = args[targetIndex].replace(/[@+\s-]/g, '')
            if (cleanNum.length >= 8) {
                targetJid = `${cleanNum}@s.whatsapp.net`
            }
        }

        if (!targetJid) {
            return reply('❌ Informe o usuário alvo.\n\n📌 *Exemplos:*\n• `.banstatus @usuario Marcação abusiva`\n• `.banstatus off @usuario`\n• `.banstatus list`')
        }

        if (isUnblock) {
            permissionRepo.setStatusBlocked(targetJid, false)
            logger.info(`[BANSTATUS] ${sender} removeu restrição de status de ${targetJid}`)
            return reply(`🔔 *RESTRIÇÃO DE STATUS REMOVIDA!*\n\nO usuário @${targetJid.split('@')[0]} teve suas permissões de status restabelecidas.`, [targetJid])
        }

        const reason = args.slice(1).join(' ') || 'Marcação indevida ou flood nos status'
        permissionRepo.setStatusBlocked(targetJid, true, reason, sender)
        logger.info(`[BANSTATUS] ${sender} bloqueou status de ${targetJid}. Motivo: ${reason}`)

        await reply(`🔕 *RESTRIÇÃO DE STATUS APLICADA!*\n\n👤 *Usuário:* @${targetJid.split('@')[0]}\n📝 *Motivo:* ${reason}\n🛡️ *Autor:* @${sender.split('@')[0]}`, [targetJid, sender])
    }
}

