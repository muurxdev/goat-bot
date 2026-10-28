/**
 * Comando .setname / .setbotname
 * Altera dinamicamente o nome oficial do bot em todos os menus, cards e mensagens
 */

const { setBotName, getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'setbotname',
    aliases: ['setname', 'botname', 'nomebot', 'renomearbot'],
    category: 'owner',
    subcategory: 'Personalização',
    description: 'Troca o nome que eu uso nos menus, cartões e mensagens',
    usage: '<novo nome>',
    examples: [
        ' — mostra meu nome atual',
        'GOAT — passo a me chamar GOAT'
    ],
    ownerOnly: true,
    execute: async ({ text, reply, sender, prefix = '.' }) => {
        const newName = (text || '').trim()
        if (!newName) {
            return reply(F.tela({
                emoji: '🏷️',
                titulo: `Meu nome: ${getBotName()}`,
                intro: 'É o nome que aparece nos menus, nos cartões de download e nas minhas mensagens.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Para trocar, digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'setname', 'GOAT')}`,
                        `• ${F.cmd(prefix, 'setname', 'ᶜᴿᴬᶻᵞ𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨✖️‿✖️•')}`
                    ]
                }],
                dica: 'Letras estilizadas e emojis funcionam normalmente.',
                proximos: [{ nome: 'setmenuname', oque: 'muda só os títulos dos menus' }],
                prefix
            }))
        }

        const success = setBotName(newName)
        if (success) {
            logger.info(`[SETNAME] ${sender} alterou o nome do bot para: ${newName}`)
            return reply(F.tela({
                emoji: '✨',
                titulo: 'Nome atualizado',
                intro: `Pronto, agora me chamo *${newName}*. O nome novo já vale em todos os menus, cartões e mensagens.`,
                proximos: [{ nome: 'menu', oque: 'vê o menu com o nome novo' }],
                prefix
            }))
        }
        logger.error(`[SETNAME] Falha ao salvar o nome "${newName}" pedido por ${sender}`)
        return reply(F.tela({
            emoji: '❌',
            titulo: 'Não consegui salvar o nome',
            intro: `Meu nome continua *${getBotName()}*. Tente de novo em instantes; se repetir, confira os registros do servidor.`,
            proximos: [{ nome: 'setname', args: newName, oque: 'tenta de novo' }],
            prefix
        }))
    }
}
