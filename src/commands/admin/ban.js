/**
 * Comando .ban
 * Remove participantes do grupo com suporte a menção, resposta e número.
 * Admin também pode ser removido; só o criador do grupo é protegido.
 */

const groupRemovalService = require('../../services/groupRemovalService')
const figurinhaEventoService = require('../../services/figurinhaEventoService')
const audioEventoService = require('../../services/audioEventoService')

module.exports = {
    name: 'ban',
    aliases: ["banir","cmd_ban","alt_ban","atalho_ban","abrev_ban","call_ban","func_ban"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Remove um participante do grupo (inclusive admins, exceto o criador)',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ info, from, sender, args, client, reply, quotedSender, prefix = '.' }) => {
        const target = groupRemovalService.extrairAlvo({ info, args, quotedSender })

        if (!target) {
            return reply(`❓ Marque, responda ou digite o número de quem devo remover.\n\nExemplo: \`${prefix}ban @pessoa\``)
        }

        const resultado = await groupRemovalService.removerMembro(client, from, target, { autor: sender, origem: 'ban' })
        if (!resultado.ok) {
            return reply(groupRemovalService.mensagemFalha(resultado.motivo, resultado.apiJid || target), [resultado.apiJid || target])
        }

        const alvo = resultado.apiJid
        await reply(`✅ @${alvo.split('@')[0].split(':')[0]} foi removido do grupo por @${sender.split('@')[0].split(':')[0]}.`, [alvo, sender])
        await figurinhaEventoService.enviar(client, from, 'banimento')
        await audioEventoService.enviar(client, from, 'banimento')
    }
}
