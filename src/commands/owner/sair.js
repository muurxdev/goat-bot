/**
 * Comando .sair / .sairbot / .leavebot
 * Faz o próprio bot sair de um grupo especificado por JID ou do grupo atual
 * Comando exclusivo dos Donos do bot
 */

const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'sair',
    aliases: ['sairbot', 'leavebot', 'quitbot', 'desconectar', 'sairgrupo', 'quitgroup'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Me faz sair deste grupo ou de outro grupo pelo código dele',
    usage: '[código do grupo]',
    examples: [
        ' — saio do grupo onde você mandou o comando',
        '120363000000000000@g.us — saio do grupo com esse código (veja em .grupos)'
    ],
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, from, isGroup, client, reply, sender, prefix = '.' }) => {
        const targetGroup = (text || '').trim() || (isGroup ? from : null)

        if (!targetGroup || !targetGroup.endsWith('@g.us')) {
            return reply(F.tela({
                prefix,
                emoji: '👋',
                titulo: 'De qual grupo eu saio?',
                intro: (text || '').trim()
                    ? 'Esse código não é de grupo. O código de grupo termina em @g.us.'
                    : 'No privado eu preciso do código do grupo. Dentro de um grupo, basta mandar o comando lá.',
                secoes: [{
                    emoji: '✍️', titulo: 'Digite assim', linhas: [
                        `• ${F.cmd(prefix, 'sair')} — dentro do grupo`,
                        `• ${F.cmd(prefix, 'sair', '120363000000000000@g.us')} — de qualquer lugar`
                    ]
                }],
                proximos: [{ nome: 'grupos', oque: 'ver os códigos dos grupos onde estou' }]
            }))
        }

        const aqui = isGroup && targetGroup === from

        try {
            await reply(aqui
                ? '👋 *Estou saindo deste grupo.* Obrigado pela companhia, até a próxima!'
                : '👋 *Saindo do grupo pedido...* Aviso aqui se algo der errado.')
            await new Promise(r => setTimeout(r, 1000))
            await client.groupLeave(targetGroup)
            logger.info(`[GROUP LEAVE] Dono ${sender} fez o bot sair do grupo: ${targetGroup}`)
            if (!aqui) {
                return reply(F.tela({
                    prefix,
                    emoji: '✅',
                    titulo: 'Saí do grupo',
                    intro: 'Não estou mais nesse grupo e não respondo mais nada lá.',
                    proximos: [
                        { nome: 'grupos', oque: 'ver os grupos onde continuo' },
                        { nome: 'entrar', args: 'https://chat.whatsapp.com/CODIGO', oque: 'voltar por um link de convite' }
                    ]
                }))
            }
        } catch (err) {
            // "conflict"/"forbidden"/"not-authorized" aqui = o bot NÃO está nesse grupo
            // (ou já saiu). Também não é falha: respondemos claro em vez de erro cru.
            const reason = String(err?.message || '').toLowerCase()
            const status = err?.data || err?.output?.statusCode
            if (reason.includes('conflict') || reason.includes('forbidden') || reason.includes('not-authorized') ||
                status === 409 || status === 403 || status === 401 || status === 404) {
                return reply(F.tela({
                    prefix,
                    emoji: 'ℹ️',
                    titulo: 'Não estou nesse grupo',
                    intro: 'Ou nunca entrei, ou já saí dele. Não precisei fazer nada.',
                    proximos: [{ nome: 'grupos', oque: 'ver os grupos onde estou' }]
                }))
            }
            logger.error(`[SAIR ERROR] grupo=${targetGroup}`, err)
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui sair do grupo',
                intro: 'O WhatsApp não aceitou o pedido agora. Tente de novo em instantes.',
                dica: 'O motivo detalhado ficou no log do dia.',
                proximos: [{ nome: 'sair', args: aqui ? '' : targetGroup, oque: 'tentar de novo' }]
            }))
        }
    }
}
